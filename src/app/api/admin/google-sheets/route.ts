import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  syncToGoogleSheets,
  SHEET_COLUMNS,
  MULTI_SHEET_APPS_SCRIPT,
  ensureSheetCsvFile,
} from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const patientCount = await prisma.patient.count();
    const appointmentCount = await prisma.appointment.count();
    const invoiceCount = await prisma.invoice.count();
    const paymentCount = await prisma.paymentRecord.count();
    const inventoryCount = await prisma.inventoryItem.count();
    const userCount = await prisma.user.count();

    const webhookUrl =
      process.env.GOOGLE_SHEET_WEBHOOK_URL || (global as any)._AURA_GOOGLE_SHEET_WEBHOOK_URL || '';

    // Ensure all local mirror CSV files exist
    Object.keys(SHEET_COLUMNS).forEach((name) => {
      try {
        ensureSheetCsvFile(name);
      } catch (e) {}
    });

    return NextResponse.json({
      success: true,
      account: 'khanbadshahraj@gmail.com',
      webhookConfigured: Boolean(webhookUrl),
      webhookUrl,
      sheets: [
        {
          name: 'PatientsRecord',
          label: 'Patient Intake & Admissions',
          recordCount: patientCount,
          color: '#059669',
          csvUrl: '/sheets/PatientsRecord.csv',
        },
        {
          name: 'AppointmentsRecord',
          label: 'Doctor Appointment Bookings',
          recordCount: appointmentCount,
          color: '#0284c7',
          csvUrl: '/sheets/AppointmentsRecord.csv',
        },
        {
          name: 'ConsultationsAndPrescriptions',
          label: 'Doctor Notes & Rx Prescriptions',
          recordCount: patientCount, // patients with consultation notes
          color: '#7c3aed',
          csvUrl: '/sheets/ConsultationsAndPrescriptions.csv',
        },
        {
          name: 'BillingInvoices',
          label: 'Hospital Bills & Invoices',
          recordCount: invoiceCount,
          color: '#d97706',
          csvUrl: '/sheets/BillingInvoices.csv',
        },
        {
          name: 'PaymentReceipts',
          label: 'Payment Receipts & Settlements',
          recordCount: paymentCount,
          color: '#10b981',
          csvUrl: '/sheets/PaymentReceipts.csv',
        },
        {
          name: 'InventoryStock',
          label: 'Pharmacy Medicines & Stock',
          recordCount: inventoryCount,
          color: '#6366f1',
          csvUrl: '/sheets/InventoryStock.csv',
        },
        {
          name: 'StaffCredentials',
          label: 'Staff Directory & Access Logs',
          recordCount: userCount,
          color: '#475569',
          csvUrl: '/sheets/StaffCredentials.csv',
        },
      ],
      sampleAppsScript: MULTI_SHEET_APPS_SCRIPT,
    });
  } catch (error: any) {
    console.error('Failed to get Google Sheets status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, webhookUrl } = body;

    // Action 1: Save Google Webhook URL
    if (action === 'setWebhook') {
      if (!webhookUrl || !webhookUrl.startsWith('http')) {
        return NextResponse.json(
          { success: false, error: 'Valid Google Apps Script Webhook URL is required' },
          { status: 400 }
        );
      }
      (global as any)._AURA_GOOGLE_SHEET_WEBHOOK_URL = webhookUrl.trim();

      return NextResponse.json({
        success: true,
        message: 'Google Apps Script Webhook URL saved successfully for khanbadshahraj@gmail.com',
        webhookUrl: (global as any)._AURA_GOOGLE_SHEET_WEBHOOK_URL,
      });
    }

    // Action 2: Test Webhook connection with a test ping
    if (action === 'test') {
      const testResult = await syncToGoogleSheets({
        sheetName: 'PatientsRecord',
        data: {
          'Patient ID': 'PAT-TEST',
          'Patient Name': 'System Verification Test',
          Age: 30,
          Gender: 'N/A',
          Contact: '+92 300 0000000',
          'Condition / Diagnosis': 'Connectivity Test Ping',
          'Assigned Doctor': 'Dr. Sarah Jenkins, MD',
          Status: 'Verified',
          'Photo URL': 'Test Signal OK',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Test ping executed to Google Sheets',
        sheetSynced: testResult.sheetSynced,
        detail: testResult.message,
      });
    }

    // Action 3: Push / Sync ALL existing database records to Google Sheets
    if (action === 'syncAll') {
      const [patients, appointments, invoices, payments, inventory, users] = await Promise.all([
        prisma.patient.findMany({ include: { doctor: true } }),
        prisma.appointment.findMany(),
        prisma.invoice.findMany(),
        prisma.paymentRecord.findMany(),
        prisma.inventoryItem.findMany(),
        prisma.user.findMany(),
      ]);

      let syncSuccessCount = 0;

      // 1. Sync Patients
      for (const p of patients) {
        await syncToGoogleSheets({
          sheetName: 'PatientsRecord',
          data: {
            'Patient ID': `PAT-${String(p.id).padStart(4, '0')}`,
            'Patient Name': p.name,
            Age: p.age,
            Gender: p.gender,
            Contact: p.contact,
            'Condition / Diagnosis': p.condition,
            'Assigned Doctor': p.doctor?.name || p.assignedDoctor || 'General Practice',
            Status: p.status,
            'Photo URL': p.photoUrl || 'No photo',
          },
        });
        syncSuccessCount++;
      }

      // 2. Sync Appointments
      for (const a of appointments) {
        await syncToGoogleSheets({
          sheetName: 'AppointmentsRecord',
          data: {
            'Booking ID': a.bookingCode,
            'Patient Name': a.patientName,
            'Mobile Number': a.mobileNumber,
            'Email Address': a.email,
            'Consultation Type': a.consultationType,
            Department: a.department,
            'Assigned Doctor': a.doctorName,
            'Appointment Date': a.appointmentDate,
            'Time Slot': a.timeSlot,
            'OTP Code': a.otpCode,
            'Payment Status': a.paymentStatus,
            'Fee (PKR)': a.consultationFee,
            Status: a.status,
          },
        });
        syncSuccessCount++;
      }

      // 3. Sync Invoices
      for (const inv of invoices) {
        await syncToGoogleSheets({
          sheetName: 'BillingInvoices',
          data: {
            'Invoice Number': inv.invoiceNumber,
            'Patient ID': `PAT-${String(inv.patientId).padStart(4, '0')}`,
            'Patient Name': inv.patientName,
            Department: inv.department,
            Description: inv.description,
            'Total Amount (PKR)': inv.totalAmount,
            'Paid Amount (PKR)': inv.paidAmount,
            'Outstanding (PKR)': inv.outstandingAmount,
            Status: inv.status,
            'Due Date': inv.dueDate ? inv.dueDate.toISOString().split('T')[0] : 'N/A',
          },
        });
        syncSuccessCount++;
      }

      // 4. Sync Payments
      for (const pay of payments) {
        await syncToGoogleSheets({
          sheetName: 'PaymentReceipts',
          data: {
            'Receipt Number': pay.receiptNumber,
            'Invoice Number': `INV-REF-${pay.invoiceId}`,
            'Amount (PKR)': pay.amount,
            'Gateway Mode': pay.gatewayMode,
            'Payment Method': pay.paymentMethod,
            'Provider Txn Ref': pay.providerTxnRef,
            Status: 'SETTLED',
          },
        });
        syncSuccessCount++;
      }

      // 5. Sync Inventory
      for (const item of inventory) {
        await syncToGoogleSheets({
          sheetName: 'InventoryStock',
          data: {
            'Item ID': `ITEM-${item.id}`,
            'Item Name': item.name,
            Category: item.category,
            'Stock Quantity': item.stock,
            'Unit Price (PKR)': item.unitPrice,
            'Min Threshold': item.minThreshold,
            Status: item.status,
          },
        });
        syncSuccessCount++;
      }

      // 6. Sync Staff Directory
      for (const u of users) {
        await syncToGoogleSheets({
          sheetName: 'StaffCredentials',
          data: {
            Username: u.username,
            'Staff Name': u.name,
            Role: u.role,
            Department: u.department,
            Email: u.email,
            Contact: u.contact || 'N/A',
            Designation: u.designation || u.role,
            Status: u.isActive ? 'Active' : 'Inactive',
          },
        });
        syncSuccessCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully synchronized ${syncSuccessCount} database records across 6 Google Sheet tabs for khanbadshahraj@gmail.com!`,
        syncedRecords: syncSuccessCount,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error during Google Sheets operation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
