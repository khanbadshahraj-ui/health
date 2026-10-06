import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const CSV_FILE_PATH = path.join(process.cwd(), 'public', 'AppointmentsRecord.csv');
const PHOTOS_DIR = path.join(process.cwd(), 'public', 'patient-photos');

// Standard daily consultancy time slots
export const STANDARD_TIME_SLOTS = [
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
  '11:30 AM - 12:00 PM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:00 PM - 03:30 PM',
  '03:30 PM - 04:00 PM',
  '04:00 PM - 04:30 PM',
  '04:30 PM - 05:00 PM',
];

function ensureAppointmentsCsvFile() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  }

  if (!fs.existsSync(CSV_FILE_PATH)) {
    const headers = [
      'Timestamp',
      'Booking ID',
      'Patient Name',
      'Mobile Number',
      'Email Address',
      'Consultation Type',
      'Department',
      'Assigned Doctor',
      'Appointment Date',
      'Time Slot',
      'OTP Code',
      'Payment Status',
      'Payment Method',
      'Transaction ID',
      'Amount ($)',
      'Photo URL',
      'Booking Status',
      'SMS Status',
      'Email Status',
      'Google Sheet Linked',
    ].map((f) => `"${f}"`).join(',') + '\n';

    fs.writeFileSync(CSV_FILE_PATH, headers, 'utf8');
  }
}

function appendAppointmentToCsv(data: {
  timestamp: string;
  bookingCode: string;
  patientName: string;
  mobileNumber: string;
  email: string;
  consultationType: string;
  department: string;
  doctorName: string;
  appointmentDate: string;
  timeSlot: string;
  otpCode: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  photoUrl: string;
  status: string;
  smsSent: boolean;
  emailSent: boolean;
}) {
  ensureAppointmentsCsvFile();

  const escapeCsv = (val: any) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const row = [
    escapeCsv(data.timestamp),
    escapeCsv(data.bookingCode),
    escapeCsv(data.patientName),
    escapeCsv(data.mobileNumber),
    escapeCsv(data.email),
    escapeCsv(data.consultationType),
    escapeCsv(data.department),
    escapeCsv(data.doctorName),
    escapeCsv(data.appointmentDate),
    escapeCsv(data.timeSlot),
    escapeCsv(data.otpCode),
    escapeCsv(data.paymentStatus),
    escapeCsv(data.paymentMethod),
    escapeCsv(data.transactionId),
    escapeCsv(data.amount),
    escapeCsv(data.photoUrl),
    escapeCsv(data.status),
    escapeCsv(data.smsSent ? 'Delivered via SMS' : 'Pending'),
    escapeCsv(data.emailSent ? 'Sent to Inbox' : 'Pending'),
    escapeCsv('https://docs.google.com/spreadsheets/d/1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew/edit'),
  ].join(',') + '\n';

  fs.appendFileSync(CSV_FILE_PATH, row, 'utf8');
}

export async function GET(request: Request) {
  try {
    ensureAppointmentsCsvFile();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const doctorId = searchParams.get('doctorId');
    const department = searchParams.get('department');

    const where: any = {};
    if (date) where.appointmentDate = date;
    if (doctorId) where.doctorId = Number(doctorId);
    if (department && department !== 'All') where.department = department;

    // Fetch all booked appointments matching filter
    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: {
          select: { id: true, name: true, specialty: true, avatarUrl: true, contact: true, email: true },
        },
      },
    });

    // Also fetch doctors for filter & selection
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        name: true,
        specialty: true,
        availability: true,
        contact: true,
        email: true,
        experience: true,
        avatarUrl: true,
      },
    });

    // Calculate slots status for the chosen doctor & date
    let slotsStatus = STANDARD_TIME_SLOTS.map((slot) => {
      const occupiedBy = appointments.find(
        (a) => a.timeSlot === slot && (!doctorId || a.doctorId === Number(doctorId))
      );

      return {
        timeSlot: slot,
        isOccupied: Boolean(occupiedBy),
        status: occupiedBy ? 'Occupied' : 'Vacant',
        appointment: occupiedBy
          ? {
              id: occupiedBy.id,
              bookingCode: occupiedBy.bookingCode,
              patientName: occupiedBy.patientName,
              consultationType: occupiedBy.consultationType,
              doctorName: occupiedBy.doctorName,
              department: occupiedBy.department,
              paymentStatus: occupiedBy.paymentStatus,
              photoUrl: occupiedBy.photoUrl,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      totalBooked: appointments.length,
      appointments,
      doctors,
      standardSlots: STANDARD_TIME_SLOTS,
      slotsStatus,
      googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew/edit',
      csvDownloadUrl: '/AppointmentsRecord.csv',
    });
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    ensureAppointmentsCsvFile();
    const body = await request.json();

    const {
      patientName,
      mobileNumber,
      email,
      consultationType,
      department,
      doctorId,
      appointmentDate,
      timeSlot,
      paymentMethod,
      photoData,
      googleSheetWebhookUrl,
    } = body;

    // Compulsory field validation
    if (!patientName || !patientName.trim()) {
      return NextResponse.json({ error: 'Patient name is compulsory' }, { status: 400 });
    }
    if (!mobileNumber || !mobileNumber.trim()) {
      return NextResponse.json({ error: 'Mobile number is compulsory' }, { status: 400 });
    }
    if (!timeSlot) {
      return NextResponse.json({ error: 'Please select a consultancy time slot' }, { status: 400 });
    }

    const docId = Number(doctorId) || 1;
    const doc = await prisma.doctor.findUnique({ where: { id: docId } });
    const doctorName = doc ? doc.name : 'Dr. Sarah Jenkins, MD';
    const dept = department || (doc ? doc.specialty : 'General Practice');
    const appDate = appointmentDate || new Date().toISOString().split('T')[0];

    // Slot collision check: ensure slot is vacant
    const slotKey = `${appDate}_doc${docId}_${timeSlot}`;
    const existing = await prisma.appointment.findFirst({
      where: {
        appointmentDate: appDate,
        doctorId: docId,
        timeSlot: timeSlot,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Time slot ${timeSlot} is already occupied for ${doctorName}. Please pick another slot.` },
        { status: 409 }
      );
    }

    // 1. Process optional picture captured from camera
    let photoUrl = '';
    if (photoData && typeof photoData === 'string' && photoData.startsWith('data:image/')) {
      try {
        const matches = photoData.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const extension = matches[1] === 'png' ? 'png' : 'jpg';
          const buffer = Buffer.from(matches[2], 'base64');
          const cleanName = patientName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
          const fileName = `consult_patient_${Date.now()}_${cleanName}.${extension}`;
          const filePath = path.join(PHOTOS_DIR, fileName);

          fs.writeFileSync(filePath, buffer);
          photoUrl = `/patient-photos/${fileName}`;
        }
      } catch (photoErr) {
        console.error('Error saving consult patient photo:', photoErr);
      }
    }

    // 2. Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Generate booking code & transaction ID
    const bookingCode = `BK-${Date.now().toString().slice(-6)}`;
    const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const feeAmount = consultationType === 'Online Video Call' ? 45.0 : 60.0;

    // 4. Save Appointment to SQLite
    const newAppointment = await prisma.appointment.create({
      data: {
        bookingCode,
        patientName: patientName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: (email || '').trim(),
        consultationType: consultationType || 'Online Video Call',
        department: dept,
        doctorId: docId,
        doctorName,
        appointmentDate: appDate,
        timeSlot,
        slotKey,
        otpCode,
        paymentStatus: 'Paid (Advance)',
        paymentMethod: paymentMethod || 'Credit/Debit Card',
        transactionId,
        consultationFee: feeAmount,
        photoUrl: photoUrl || null,
        status: 'Confirmed',
        smsSent: true,
        emailSent: Boolean(email && email.includes('@')),
      },
      include: {
        doctor: true,
      },
    });

    // Also register patient into patient registry if not already present
    try {
      const existingPatient = await prisma.patient.findFirst({
        where: { name: patientName.trim() },
      });
      if (!existingPatient) {
        await prisma.patient.create({
          data: {
            name: patientName.trim(),
            age: 30, // Default adult
            gender: 'Not specified',
            contact: mobileNumber.trim(),
            condition: `${dept} Consultation (${consultationType})`,
            status: 'Outpatient',
            doctorId: docId,
            assignedDoctor: doctorName,
            photoUrl: photoUrl || null,
            roomNumber: consultationType === 'Online Video Call' ? 'Virtual Video Room' : 'Exam Suite 2',
          },
        });
      }
    } catch (e) {
      console.warn('Note: patient registry sync notice', e);
    }

    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });

    // 5. Append record to AppointmentsRecord.csv
    appendAppointmentToCsv({
      timestamp,
      bookingCode,
      patientName: newAppointment.patientName,
      mobileNumber: newAppointment.mobileNumber,
      email: newAppointment.email,
      consultationType: newAppointment.consultationType,
      department: newAppointment.department,
      doctorName: newAppointment.doctorName,
      appointmentDate: newAppointment.appointmentDate,
      timeSlot: newAppointment.timeSlot,
      otpCode: newAppointment.otpCode,
      paymentStatus: newAppointment.paymentStatus,
      paymentMethod: newAppointment.paymentMethod,
      transactionId: newAppointment.transactionId,
      amount: newAppointment.consultationFee,
      photoUrl: photoUrl || 'No photo uploaded',
      status: newAppointment.status,
      smsSent: newAppointment.smsSent,
      emailSent: newAppointment.emailSent,
    });

    // 6. Google Sheet sync payload
    const sheetPayload = {
      spreadsheetId: '1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew',
      sheetName: 'Consultancy_Appointments',
      timestamp,
      bookingCode,
      patientName: newAppointment.patientName,
      mobileNumber: newAppointment.mobileNumber,
      email: newAppointment.email,
      consultationType: newAppointment.consultationType,
      department: newAppointment.department,
      doctorName: newAppointment.doctorName,
      appointmentDate: newAppointment.appointmentDate,
      timeSlot: newAppointment.timeSlot,
      otpCode: newAppointment.otpCode,
      paymentStatus: newAppointment.paymentStatus,
      paymentMethod: newAppointment.paymentMethod,
      transactionId: newAppointment.transactionId,
      fee: newAppointment.consultationFee,
      photoUrl: photoUrl || '',
    };

    let sheetSynced = false;
    let sheetMessage = 'Appended to AppointmentsRecord.csv & staged for Google Sheet';

    const targetWebhook = googleSheetWebhookUrl || process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (targetWebhook) {
      try {
        const sheetRes = await fetch(targetWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sheetPayload),
        });
        if (sheetRes.ok) {
          sheetSynced = true;
          sheetMessage = 'Successfully synced with Google Spreadsheet (1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew)';
        }
      } catch (sheetErr: any) {
        console.warn('Google Sheet webhook notice:', sheetErr.message);
      }
    }

    // 7. Notification Logs Simulation
    const notifications = {
      otp: otpCode,
      patientSms: {
        to: mobileNumber,
        text: `[AuraCare Clinic] Your appointment #${bookingCode} with ${doctorName} on ${appDate} at ${timeSlot} is CONFIRMED. Your Secure Consultation OTP is ${otpCode}. Present this at consultation. Paid $${feeAmount.toFixed(2)}.`,
        status: 'Delivered',
        time: new Date().toLocaleTimeString(),
      },
      doctorSms: {
        to: doc?.contact || '+1 (555) 000-0000',
        text: `[AuraCare Staff] New booking #${bookingCode}: Patient ${patientName} (${consultationType}) on ${appDate} at ${timeSlot}. Verification OTP: ${otpCode}.`,
        status: 'Delivered',
        time: new Date().toLocaleTimeString(),
      },
      patientEmail: {
        to: email || 'patient@domain.com',
        subject: `Appointment Confirmation #${bookingCode} - AuraCare Clinic`,
        content: `Dear ${patientName}, your ${consultationType} with ${doctorName} is confirmed for ${appDate} (${timeSlot}). Verification OTP: ${otpCode}. Transaction ID: ${transactionId}.`,
        status: email ? 'Sent to Inbox' : 'Skipped (No Email)',
        time: new Date().toLocaleTimeString(),
      },
      doctorEmail: {
        to: doc?.email || 'physician@clinic.org',
        subject: `Schedule Update: Patient Booking #${bookingCode}`,
        content: `Patient ${patientName} has reserved slot ${timeSlot} on ${appDate}. Mode: ${consultationType}. OTP: ${otpCode}.`,
        status: 'Sent to Inbox',
        time: new Date().toLocaleTimeString(),
      },
    };

    return NextResponse.json(
      {
        success: true,
        appointment: newAppointment,
        otpCode,
        notifications,
        sheetSynced,
        sheetMessage,
        csvUrl: '/AppointmentsRecord.csv',
        googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew/edit',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
