import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Helper to parse CSV lines with quoted fields
function parseCsv(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let insideQuote = false;
    let field = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    row.push(field.trim());
    rows.push(row);
  }

  return rows;
}

async function uploadAllSampleData() {
  console.log('================================================================');
  console.log('   UPLOADING ALL SAMPLE DATA FROM RELEVANT FILES TO DATABASE    ');
  console.log('================================================================\n');

  // 1. Doctors Seed Data
  console.log('1. Processing Doctors...');
  const defaultDoctors = [
    {
      name: 'Dr. Sarah Jenkins, MD',
      specialty: 'General Practice',
      availability: 'On Duty',
      contact: '+1 (555) 234-8901',
      email: 'sarah.jenkins@clinic.org',
      experience: '12 years',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Dr. Marcus Vance, MD',
      specialty: 'Pediatrics',
      availability: 'On Duty',
      contact: '+1 (555) 345-6789',
      email: 'marcus.vance@clinic.org',
      experience: '9 years',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Dr. Elena Rostova, MD',
      specialty: 'Cardiology',
      availability: 'On Call',
      contact: '+1 (555) 456-7890',
      email: 'elena.rostova@clinic.org',
      experience: '15 years',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813511-094191c964e5?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Dr. David Kim, MD',
      specialty: 'Orthopedics',
      availability: 'On Duty',
      contact: '+1 (555) 567-8901',
      email: 'david.kim@clinic.org',
      experience: '11 years',
      avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Dr. Anita Desai, MD',
      specialty: 'Dermatology',
      availability: 'Off Duty',
      contact: '+1 (555) 678-9012',
      email: 'anita.desai@clinic.org',
      experience: '8 years',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    },
  ];

  for (const doc of defaultDoctors) {
    const existing = await prisma.doctor.findUnique({ where: { email: doc.email } });
    if (!existing) {
      await prisma.doctor.create({ data: doc });
      console.log(`  + Created doctor: ${doc.name} (${doc.specialty})`);
    } else {
      console.log(`  = Doctor already exists: ${doc.name}`);
    }
  }

  const allDoctors = await prisma.doctor.findMany();

  // Helper to match doctor by name or specialty
  const findDoctor = (nameOrSpec?: string) => {
    if (!nameOrSpec) return allDoctors[0];
    const match = allDoctors.find(
      (d) =>
        d.name.toLowerCase().includes(nameOrSpec.toLowerCase()) ||
        d.specialty.toLowerCase().includes(nameOrSpec.toLowerCase())
    );
    return match || allDoctors[0];
  };

  // 2. Patients Seed Data
  console.log('\n2. Processing Patients (from seed & public/PatientsRecord.csv)...');
  const basePatients = [
    {
      name: 'Arthur Pendelton',
      age: 64,
      gender: 'Male',
      contact: '+1 (555) 111-2233',
      condition: 'Hypertension & Type 2 Diabetes',
      status: 'Admitted',
      doctorName: 'Dr. Sarah Jenkins, MD',
      roomNumber: 'Suite 104',
    },
    {
      name: 'Maya Lin Chen',
      age: 8,
      gender: 'Female',
      contact: '+1 (555) 222-3344',
      condition: 'Acute Bronchitis',
      status: 'Outpatient',
      doctorName: 'Dr. Marcus Vance, MD',
      roomNumber: 'Pediatrics Exam 2',
    },
    {
      name: 'Robert Thornton',
      age: 52,
      gender: 'Male',
      contact: '+1 (555) 333-4455',
      condition: 'Post-Stent Cardiac Observation',
      status: 'Recovering',
      doctorName: 'Dr. Elena Rostova, MD',
      roomNumber: 'Cardiac Recovery B',
    },
    {
      name: 'Sophia Rodriguez',
      age: 29,
      gender: 'Female',
      contact: '+1 (555) 444-5566',
      condition: 'Grade II Ankle Sprain & Contusion',
      status: 'Outpatient',
      doctorName: 'Dr. David Kim, MD',
      roomNumber: 'Rehab Rm 1',
    },
    {
      name: 'George Gallagher',
      age: 43,
      gender: 'Male',
      contact: '+1 (555) 555-6677',
      condition: 'Severe Allergic Contact Dermatitis',
      status: 'Under Observation',
      doctorName: 'Dr. Anita Desai, MD',
      roomNumber: 'Clinic Ward 3',
    },
    {
      name: 'Tariq Mehmood',
      age: 48,
      gender: 'Male',
      contact: '+92 300 1234567',
      condition: 'Hypertension & CAD',
      status: 'Inpatient',
      doctorName: 'Dr. Elena Rostova, MD',
      roomNumber: 'Ward 3, Bed 12',
    },
    {
      name: 'Zainab Bibi',
      age: 32,
      gender: 'Female',
      contact: '+92 321 7654321',
      condition: 'Maternity Observation',
      status: 'Inpatient',
      doctorName: 'Dr. Marcus Vance, MD',
      roomNumber: 'Private Room 204',
    },
    {
      name: 'Muhammad Farhan',
      age: 26,
      gender: 'Male',
      contact: '+92 333 9876543',
      condition: 'Orthopedic Fracture (Left Fibula)',
      status: 'Outpatient',
      doctorName: 'Dr. David Kim, MD',
      roomNumber: 'OPD Clinic A',
    },
  ];

  for (const p of basePatients) {
    const existing = await prisma.patient.findFirst({
      where: { name: p.name, contact: p.contact },
    });
    const doc = findDoctor(p.doctorName);
    if (!existing) {
      await prisma.patient.create({
        data: {
          name: p.name,
          age: p.age,
          gender: p.gender,
          contact: p.contact,
          condition: p.condition,
          status: p.status,
          doctorId: doc.id,
          assignedDoctor: doc.name,
          roomNumber: p.roomNumber,
        },
      });
      console.log(`  + Created patient: ${p.name}`);
    } else {
      console.log(`  = Patient already exists: ${p.name}`);
    }
  }

  // Load from public/PatientsRecord.csv
  const patientsCsvPath = path.join(process.cwd(), 'public', 'PatientsRecord.csv');
  if (fs.existsSync(patientsCsvPath)) {
    console.log(`  Reading ${patientsCsvPath}...`);
    const csvContent = fs.readFileSync(patientsCsvPath, 'utf8');
    const rows = parseCsv(csvContent);
    // Header: "Timestamp","Patient ID","Patient Name","Age","Gender","Contact","Condition / Reason for Visit","Assigned Doctor","Status","Photo URL"
    const dataRows = rows.slice(1);
    for (const r of dataRows) {
      if (r.length < 6) continue;
      const [timestamp, patientId, name, ageStr, gender, contact, condition, assignedDoctor, status, photoUrl] = r;
      if (!name || name.trim() === '') continue;

      const existing = await prisma.patient.findFirst({
        where: { name: name.trim(), contact: contact?.trim() || '' },
      });

      const doc = findDoctor(assignedDoctor);
      if (!existing) {
        await prisma.patient.create({
          data: {
            name: name.trim(),
            age: parseInt(ageStr, 10) || 30,
            gender: gender?.trim() || 'Other',
            contact: contact?.trim() || '',
            condition: condition?.trim() || 'General Consultation',
            status: status?.trim() || 'Outpatient',
            doctorId: doc?.id || null,
            assignedDoctor: doc?.name || assignedDoctor || 'Unassigned',
            photoUrl: photoUrl && photoUrl !== 'No photo taken' ? photoUrl : null,
          },
        });
        console.log(`  + Imported CSV patient: ${name}`);
      } else {
        console.log(`  = CSV Patient already exists: ${name}`);
      }
    }
  }

  // 3. Appointments Seed Data from public/AppointmentsRecord.csv
  console.log('\n3. Processing Appointments (from public/AppointmentsRecord.csv)...');
  const aptsCsvPath = path.join(process.cwd(), 'public', 'AppointmentsRecord.csv');
  if (fs.existsSync(aptsCsvPath)) {
    console.log(`  Reading ${aptsCsvPath}...`);
    const csvContent = fs.readFileSync(aptsCsvPath, 'utf8');
    const rows = parseCsv(csvContent);
    // Header: "Timestamp","Booking ID","Patient Name","Mobile Number","Email Address","Consultation Type","Department","Assigned Doctor","Appointment Date","Time Slot","OTP Code","Payment Status","Payment Method","Transaction ID","Amount ($)","Photo URL","Booking Status","SMS Status","Email Status","Google Sheet Linked"
    const dataRows = rows.slice(1);

    for (const r of dataRows) {
      if (r.length < 10) continue;
      const [
        timestamp,
        bookingCode,
        patientName,
        mobileNumber,
        email,
        consultationType,
        department,
        assignedDoctor,
        appointmentDate,
        timeSlot,
        otpCode,
        paymentStatus,
        paymentMethod,
        transactionId,
        amountStr,
        photoUrl,
        bookingStatus,
      ] = r;

      if (!bookingCode || bookingCode.trim() === '') continue;

      const doc = findDoctor(assignedDoctor || department);
      const slotKey = `${appointmentDate}_doc${doc.id}_${timeSlot}`;

      await prisma.appointment.upsert({
        where: { bookingCode: bookingCode.trim() },
        update: {
          patientName: patientName?.trim(),
          mobileNumber: mobileNumber?.trim(),
          email: email?.trim(),
          consultationType: consultationType?.trim() || 'Online Video Call',
          department: department?.trim() || 'General Practice',
          doctorId: doc.id,
          doctorName: doc.name,
          appointmentDate: appointmentDate?.trim() || '2026-10-06',
          timeSlot: timeSlot?.trim() || '10:00 AM - 10:30 AM',
          slotKey,
          otpCode: otpCode?.trim() || '123456',
          paymentStatus: paymentStatus?.trim() || 'Paid (Advance)',
          paymentMethod: paymentMethod?.trim() || 'Credit/Debit Card',
          transactionId: transactionId?.trim() || 'TXN-DEFAULT',
          consultationFee: parseFloat(amountStr) || 50.0,
          photoUrl: photoUrl && !photoUrl.includes('No photo') ? photoUrl : null,
          status: bookingStatus?.trim() || 'Confirmed',
        },
        create: {
          bookingCode: bookingCode.trim(),
          patientName: patientName?.trim(),
          mobileNumber: mobileNumber?.trim(),
          email: email?.trim(),
          consultationType: consultationType?.trim() || 'Online Video Call',
          department: department?.trim() || 'General Practice',
          doctorId: doc.id,
          doctorName: doc.name,
          appointmentDate: appointmentDate?.trim() || '2026-10-06',
          timeSlot: timeSlot?.trim() || '10:00 AM - 10:30 AM',
          slotKey,
          otpCode: otpCode?.trim() || '123456',
          paymentStatus: paymentStatus?.trim() || 'Paid (Advance)',
          paymentMethod: paymentMethod?.trim() || 'Credit/Debit Card',
          transactionId: transactionId?.trim() || 'TXN-DEFAULT',
          consultationFee: parseFloat(amountStr) || 50.0,
          photoUrl: photoUrl && !photoUrl.includes('No photo') ? photoUrl : null,
          status: bookingStatus?.trim() || 'Confirmed',
          smsSent: true,
          emailSent: true,
        },
      });

      console.log(`  + Upserted appointment: [${bookingCode}] ${patientName} (${timeSlot})`);
    }
  }

  // 4. Inventory Items
  console.log('\n4. Processing Inventory Items...');
  const defaultItems = [
    {
      name: 'Paracetamol 500mg Tablets (100s)',
      category: 'Medicine',
      stock: 150,
      unitPrice: 8.5,
      minThreshold: 30,
      status: 'In Stock',
    },
    {
      name: 'Sterile Syringes 5ml (Box of 50)',
      category: 'Consumables',
      stock: 12,
      unitPrice: 16.2,
      minThreshold: 25,
      status: 'Low Stock',
    },
    {
      name: 'Elastic Gauze Bandages 4" (Pack of 12)',
      category: 'Supplies',
      stock: 45,
      unitPrice: 12.0,
      minThreshold: 15,
      status: 'In Stock',
    },
    {
      name: 'Amoxicillin 250mg Suspension',
      category: 'Medicine',
      stock: 8,
      unitPrice: 14.75,
      minThreshold: 20,
      status: 'Low Stock',
    },
    {
      name: 'Digital Infrared Thermometer',
      category: 'Equipment',
      stock: 22,
      unitPrice: 42.0,
      minThreshold: 5,
      status: 'In Stock',
    },
  ];

  for (const item of defaultItems) {
    const existing = await prisma.inventoryItem.findFirst({
      where: { name: item.name },
    });
    if (!existing) {
      await prisma.inventoryItem.create({ data: item });
      console.log(`  + Created inventory item: ${item.name} (${item.stock} in stock)`);
    } else {
      console.log(`  = Inventory item already exists: ${item.name}`);
    }
  }

  // 5. Invoices & Billing Seed Data
  console.log('\n5. Processing Hospital Invoices & Billing Data...');
  const patientsForBilling = await prisma.patient.findMany();
  const p1 = patientsForBilling[0];
  const p2 = patientsForBilling[1] || p1;
  const p3 = patientsForBilling[2] || p1;

  const invoicesToSeed = [
    {
      invoiceNumber: 'INV-PKR-2026-001',
      patientId: p1.id,
      patientName: p1.name,
      patientContact: p1.contact,
      department: 'Cardiology & Inpatient Ward',
      description: 'Cardiac telemetry, 3-day inpatient stay, ECG, and pathology lab diagnostics.',
      totalAmount: 24500.0,
      paidAmount: 0.0,
      outstandingAmount: 24500.0,
      currency: 'PKR',
      status: 'UNPAID',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: [
        { description: 'Inpatient Bed Charges (3 Days @ PKR 3,500/day)', quantity: 3, unitPrice: 3500.0, total: 10500.0 },
        { description: 'Consultant Cardiologist Round & Assessment', quantity: 2, unitPrice: 3000.0, total: 6000.0 },
        { description: '12-Lead Electrocardiogram (ECG)', quantity: 1, unitPrice: 2000.0, total: 2000.0 },
        { description: 'Cardiac Enzyme Profile (Troponin-I, CK-MB)', quantity: 1, unitPrice: 4500.0, total: 4500.0 },
        { description: 'Nursing & Medication Administration', quantity: 3, unitPrice: 500.0, total: 1500.0 },
      ],
    },
    {
      invoiceNumber: 'INV-PKR-2026-002',
      patientId: p2.id,
      patientName: p2.name,
      patientContact: p2.contact,
      department: 'Obstetrics & Gynecology',
      description: 'Obstetric ultrasound, fetal heart rate monitoring, and specialist checkup.',
      totalAmount: 12000.0,
      paidAmount: 12000.0,
      outstandingAmount: 0.0,
      currency: 'PKR',
      status: 'PAID',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      items: [
        { description: 'Obstetric High-Resolution Ultrasound Scan', quantity: 1, unitPrice: 5500.0, total: 5500.0 },
        { description: 'Specialist Gynecologist Consultation', quantity: 1, unitPrice: 3500.0, total: 3500.0 },
        { description: 'Prenatal Blood Screen Panel', quantity: 1, unitPrice: 3000.0, total: 3000.0 },
      ],
    },
    {
      invoiceNumber: 'INV-PKR-2026-003',
      patientId: p3.id,
      patientName: p3.name,
      patientContact: p3.contact,
      department: 'Emergency Trauma & Orthopedics',
      description: 'Emergency assessment, digital X-Ray, fiber-cast immobilization.',
      totalAmount: 6500.0,
      paidAmount: 6500.0,
      outstandingAmount: 0.0,
      currency: 'PKR',
      status: 'PAID',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      items: [
        { description: 'Emergency Room Triage & Physician Review', quantity: 1, unitPrice: 2000.0, total: 2000.0 },
        { description: 'Digital X-Ray (Ankle/Fibula 2 Views)', quantity: 1, unitPrice: 2500.0, total: 2500.0 },
        { description: 'Synthetic Fiber Cast Application', quantity: 1, unitPrice: 2000.0, total: 2000.0 },
      ],
    },
  ];

  for (const inv of invoicesToSeed) {
    const existing = await prisma.invoice.findUnique({
      where: { invoiceNumber: inv.invoiceNumber },
    });

    if (!existing) {
      await prisma.invoice.create({
        data: {
          invoiceNumber: inv.invoiceNumber,
          patientId: inv.patientId,
          patientName: inv.patientName,
          patientContact: inv.patientContact,
          department: inv.department,
          description: inv.description,
          totalAmount: inv.totalAmount,
          paidAmount: inv.paidAmount,
          outstandingAmount: inv.outstandingAmount,
          currency: inv.currency,
          status: inv.status,
          dueDate: inv.dueDate,
          items: {
            create: inv.items,
          },
        },
      });
      console.log(`  + Created invoice: ${inv.invoiceNumber} (${inv.totalAmount} PKR, ${inv.status})`);
    } else {
      console.log(`  = Invoice already exists: ${inv.invoiceNumber} (${inv.status})`);
    }
  }

  // 6. Summary Report
  console.log('\n================================================================');
  console.log('                 SAMPLE DATA UPLOAD SUMMARY                     ');
  console.log('================================================================');
  const docCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const aptCount = await prisma.appointment.count();
  const invCount = await prisma.invoice.count();
  const itemCount = await prisma.inventoryItem.count();

  console.log(`✔ Doctors in Database:        ${docCount}`);
  console.log(`✔ Patients in Database:       ${patientCount}`);
  console.log(`✔ Appointments in Database:   ${aptCount}`);
  console.log(`✔ Invoices in Database:       ${invCount}`);
  console.log(`✔ Inventory Items:            ${itemCount}`);
  console.log('================================================================\n');
}

uploadAllSampleData()
  .catch((e) => {
    console.error('Error uploading sample data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
