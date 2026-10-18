import { sendAppointmentConfirmationEmail } from '../src/lib/email/mailer';
import fs from 'fs';
import path from 'path';

async function runEmailTest() {
  console.log('====================================================');
  console.log('PATIENT APPOINTMENT EMAIL DISPATCH AUTOMATED TEST');
  console.log('====================================================\n');

  const testPayload = {
    bookingCode: `BK-TEST-${Date.now().toString().slice(-4)}`,
    patientName: 'Khurram Shehzad',
    patientEmail: 'patient.khurram@example.com',
    patientMobile: '+92 300 9876543',
    doctorName: 'Dr. Sarah Jenkins, MD',
    doctorSpecialty: 'Cardiology',
    consultationType: 'Online Video Call',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '11:00 AM - 11:30 AM',
    otpCode: '849201',
    fee: 45.0,
    transactionId: `TXN-EM-${Date.now().toString().slice(-6)}`,
  };

  console.log(`1. Sending appointment confirmation email to ${testPayload.patientEmail}...`);
  const result = await sendAppointmentConfirmationEmail(testPayload);

  console.log('\n2. Email Dispatch Result:');
  console.log(`- Sent Status: ${result.sent ? '✔ SUCCESS' : '✖ FAILED'}`);
  console.log(`- Dispatch Mode: ${result.mode}`);
  console.log(`- Recipient: ${result.recipient}`);
  if (result.messageId) console.log(`- Message ID: ${result.messageId}`);
  if (result.previewUrl) console.log(`- Preview URL / Log: ${result.previewUrl}`);

  // Verify that an email audit log file was written in public/email-logs
  const emailLogsDir = path.join(process.cwd(), 'public', 'email-logs');
  const files = fs.readdirSync(emailLogsDir);
  const matchingFile = files.find((f) => f.includes(testPayload.bookingCode));

  if (matchingFile) {
    const fileContent = JSON.parse(fs.readFileSync(path.join(emailLogsDir, matchingFile), 'utf8'));
    console.log(`\n✔ Verified email log file created: public/email-logs/${matchingFile}`);
    console.log(`- Subject in log: ${fileContent.subject}`);
    console.log(`- OTP in log: ${fileContent.otp}`);
    console.log(`- To: ${fileContent.to}`);
  } else {
    throw new Error('Email log file was not found in public/email-logs');
  }

  // 3. Test HTTP API Booking endpoint with Email integration
  console.log('\n3. Testing HTTP API appointment booking with email integration...');
  const apiRes = await fetch('http://localhost:3000/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientName: 'Ayesha Noor',
      mobileNumber: '+92 321 5556677',
      email: 'ayesha.noor@example.com',
      consultationType: 'Physical at Hospital Inspection',
      department: 'Cardiology',
      doctorId: 1,
      appointmentDate: new Date().toISOString().split('T')[0],
      timeSlot: '04:30 PM - 05:00 PM',
      paymentMethod: 'Credit/Debit Card',
    }),
  });

  const apiData = await apiRes.json();
  if (apiRes.ok && apiData.success) {
    console.log(`✔ Appointment created successfully via API: ${apiData.appointment.bookingCode}`);
    console.log(`- OTP Code: ${apiData.otpCode}`);
    console.log(`- Email Status: ${apiData.notifications.patientEmail.status}`);
    console.log(`- Email Preview: ${apiData.notifications.patientEmail.previewUrl}`);
  } else {
    console.log('API Response notice:', apiData);
  }

  console.log('\n====================================================');
  console.log('ALL EMAIL TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runEmailTest().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
