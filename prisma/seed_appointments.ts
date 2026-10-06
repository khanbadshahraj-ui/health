import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const CSV_FILE_PATH = path.join(process.cwd(), 'public', 'AppointmentsRecord.csv');

function ensureCsv() {
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

function appendCsv(row: any[]) {
  const line = row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
  fs.appendFileSync(CSV_FILE_PATH, line, 'utf8');
}

async function main() {
  console.log('Seeding 2 test patient appointments...');
  ensureCsv();

  // Find doctors
  const doctors = await prisma.doctor.findMany();
  const elena = doctors.find((d) => d.specialty === 'Cardiology') || doctors[0];
  const marcus = doctors.find((d) => d.specialty === 'Pediatrics') || doctors[1];

  const today = new Date().toISOString().split('T')[0];

  // Test Patient 1: Michael Ross
  const apt1 = await prisma.appointment.upsert({
    where: { bookingCode: 'BK-104928' },
    update: {},
    create: {
      bookingCode: 'BK-104928',
      patientName: 'Michael Ross',
      mobileNumber: '+1 (555) 782-9910',
      email: 'michael.ross@gmail.com',
      consultationType: 'Online Video Call',
      department: 'Cardiology',
      doctorId: elena.id,
      doctorName: elena.name,
      appointmentDate: today,
      timeSlot: '10:00 AM - 10:30 AM',
      slotKey: `${today}_doc${elena.id}_10:00 AM - 10:30 AM`,
      otpCode: '847291',
      paymentStatus: 'Paid (Advance)',
      paymentMethod: 'Credit/Debit Card (Visa ending in 4242)',
      transactionId: 'TXN-984124',
      consultationFee: 45.0,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      status: 'Confirmed',
      smsSent: true,
      emailSent: true,
    },
  });

  appendCsv([
    new Date().toLocaleString(),
    apt1.bookingCode,
    apt1.patientName,
    apt1.mobileNumber,
    apt1.email,
    apt1.consultationType,
    apt1.department,
    apt1.doctorName,
    apt1.appointmentDate,
    apt1.timeSlot,
    apt1.otpCode,
    apt1.paymentStatus,
    apt1.paymentMethod,
    apt1.transactionId,
    apt1.consultationFee,
    apt1.photoUrl,
    apt1.status,
    'Delivered via SMS',
    'Sent to Inbox',
    'https://docs.google.com/spreadsheets/d/1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew/edit',
  ]);

  // Test Patient 2: Claire Underwood
  const apt2 = await prisma.appointment.upsert({
    where: { bookingCode: 'BK-205819' },
    update: {},
    create: {
      bookingCode: 'BK-205819',
      patientName: 'Claire Underwood',
      mobileNumber: '+1 (555) 629-4401',
      email: 'claire.underwood@gmail.com',
      consultationType: 'Physical at Hospital Inspection',
      department: 'Pediatrics',
      doctorId: marcus.id,
      doctorName: marcus.name,
      appointmentDate: today,
      timeSlot: '02:00 PM - 02:30 PM',
      slotKey: `${today}_doc${marcus.id}_02:00 PM - 02:30 PM`,
      otpCode: '519302',
      paymentStatus: 'Paid (Advance)',
      paymentMethod: 'UPI / Digital Wallet (Apple Pay)',
      transactionId: 'TXN-419208',
      consultationFee: 60.0,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      status: 'Confirmed',
      smsSent: true,
      emailSent: true,
    },
  });

  appendCsv([
    new Date().toLocaleString(),
    apt2.bookingCode,
    apt2.patientName,
    apt2.mobileNumber,
    apt2.email,
    apt2.consultationType,
    apt2.department,
    apt2.doctorName,
    apt2.appointmentDate,
    apt2.timeSlot,
    apt2.otpCode,
    apt2.paymentStatus,
    apt2.paymentMethod,
    apt2.transactionId,
    apt2.consultationFee,
    apt2.photoUrl,
    apt2.status,
    'Delivered via SMS',
    'Sent to Inbox',
    'https://docs.google.com/spreadsheets/d/1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew/edit',
  ]);

  console.log('Successfully seeded 2 test patients:');
  console.log(`1. ${apt1.patientName} (${apt1.timeSlot}, OTP: ${apt1.otpCode})`);
  console.log(`2. ${apt2.patientName} (${apt2.timeSlot}, OTP: ${apt2.otpCode})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
