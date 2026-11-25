import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { syncToGoogleSheets } from '@/lib/googleSheets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        items: true,
        patient: {
          select: {
            id: true,
            name: true,
            contact: true,
            condition: true,
            roomNumber: true,
          },
        },
        paymentRecords: {
          orderBy: { verifiedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      patientId,
      department,
      description,
      amount,
      items,
      dueDate,
    } = body;

    const pid = Number(patientId);
    const patient = await prisma.patient.findUnique({
      where: { id: pid },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const totalAmount = parseFloat(amount) || 0;
    const invNumber = `INV-PK-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invNumber,
        patientId: patient.id,
        patientName: patient.name,
        patientContact: patient.contact,
        department: department || 'General Outpatient',
        description: description || 'Clinical Consultation & Pharmacy',
        totalAmount,
        paidAmount: 0.0,
        outstandingAmount: totalAmount,
        currency: 'PKR',
        status: 'UNPAID',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 86400000),
        items: {
          create: Array.isArray(items) && items.length > 0
            ? items.map((it: any) => ({
                description: it.description || 'Clinical Care',
                quantity: Number(it.quantity) || 1,
                unitPrice: Number(it.unitPrice) || totalAmount,
                total: Number(it.total) || totalAmount,
              }))
            : [
                {
                  description: description || 'Hospital Service / Investigation',
                  quantity: 1,
                  unitPrice: totalAmount,
                  total: totalAmount,
                },
              ],
        },
      },
      include: {
        items: true,
      },
    });

    // Dual-Write to Google Sheets: BillingInvoices tab for khanbadshahraj@gmail.com
    await syncToGoogleSheets({
      sheetName: 'BillingInvoices',
      data: {
        'Invoice Number': newInvoice.invoiceNumber,
        'Patient ID': `PAT-${String(patient.id).padStart(4, '0')}`,
        'Patient Name': patient.name,
        Department: newInvoice.department,
        Description: newInvoice.description,
        'Total Amount (PKR)': newInvoice.totalAmount,
        'Paid Amount (PKR)': 0.0,
        'Outstanding (PKR)': newInvoice.totalAmount,
        Status: 'UNPAID',
        'Due Date': newInvoice.dueDate?.toISOString().split('T')[0] || 'In 7 days',
      },
    }).catch((e) => console.warn('Invoice sheet sync notice:', e.message));

    return NextResponse.json({
      success: true,
      message: `Invoice ${newInvoice.invoiceNumber} created and synced to Google Sheets.`,
      data: newInvoice,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
