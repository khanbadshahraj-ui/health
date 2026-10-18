import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding hospital invoices in PKR...');

  // Ensure patients exist or fetch existing ones
  let patients = await prisma.patient.findMany();
  if (patients.length === 0) {
    console.log('No patients found. Creating sample Pakistani hospital patients...');
    const p1 = await prisma.patient.create({
      data: {
        name: 'Tariq Mehmood',
        age: 48,
        gender: 'Male',
        contact: '+92 300 1234567',
        condition: 'Hypertension & CAD',
        status: 'Inpatient',
        roomNumber: 'Ward 3, Bed 12',
      },
    });
    const p2 = await prisma.patient.create({
      data: {
        name: 'Zainab Bibi',
        age: 32,
        gender: 'Female',
        contact: '+92 321 7654321',
        condition: 'Maternity Observation',
        status: 'Inpatient',
        roomNumber: 'Private Room 204',
      },
    });
    const p3 = await prisma.patient.create({
      data: {
        name: 'Muhammad Farhan',
        age: 26,
        gender: 'Male',
        contact: '+92 333 9876543',
        condition: 'Orthopedic Fracture (Left Fibula)',
        status: 'Outpatient',
        roomNumber: 'OPD Clinic A',
      },
    });
    patients = [p1, p2, p3];
  }

  const patient1 = patients[0];
  const patient2 = patients[1] || patients[0];
  const patient3 = patients[2] || patients[0];

  // Clean existing test invoices if any
  await prisma.paymentRecord.deleteMany();
  await prisma.paymentAttempt.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();

  // 1. Invoice 1: Inpatient Ward & Cardiology (Unpaid, PKR 24,500)
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-PKR-2026-001',
      patientId: patient1.id,
      patientName: patient1.name,
      patientContact: patient1.contact,
      department: 'Cardiology & Inpatient Ward',
      description: 'Cardiac telemetry, 3-day inpatient stay, ECG, and pathology lab diagnostics.',
      totalAmount: 24500.0,
      paidAmount: 0.0,
      outstandingAmount: 24500.0,
      currency: 'PKR',
      status: 'UNPAID',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { description: 'Inpatient Bed Charges (3 Days @ PKR 3,500/day)', quantity: 3, unitPrice: 3500.0, total: 10500.0 },
          { description: 'Consultant Cardiologist Round & Assessment', quantity: 2, unitPrice: 3000.0, total: 6000.0 },
          { description: '12-Lead Electrocardiogram (ECG)', quantity: 1, unitPrice: 2000.0, total: 2000.0 },
          { description: 'Cardiac Enzyme Profile (Troponin-I, CK-MB)', quantity: 1, unitPrice: 4500.0, total: 4500.0 },
          { description: 'Nursing & Medication Administration', quantity: 3, unitPrice: 500.0, total: 1500.0 },
        ],
      },
    },
  });

  // 2. Invoice 2: Maternity Care & Ultrasound (Unpaid, PKR 12,000)
  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-PKR-2026-002',
      patientId: patient2.id,
      patientName: patient2.name,
      patientContact: patient2.contact,
      department: 'Obstetrics & Gynecology',
      description: 'Obstetric ultrasound, fetal heart rate monitoring, and specialist checkup.',
      totalAmount: 12000.0,
      paidAmount: 0.0,
      outstandingAmount: 12000.0,
      currency: 'PKR',
      status: 'UNPAID',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { description: 'Consultant Specialist Visit', quantity: 1, unitPrice: 3500.0, total: 3500.0 },
          { description: 'Obstetric 3D/4D Ultrasound Scan', quantity: 1, unitPrice: 5500.0, total: 5500.0 },
          { description: 'Complete Blood Count (CBC) & Urine RE', quantity: 1, unitPrice: 1800.0, total: 1800.0 },
          { description: 'Pharmacy & Nutritional Supplements', quantity: 1, unitPrice: 1200.0, total: 1200.0 },
        ],
      },
    },
  });

  // 3. Invoice 3: Orthopedic Consultation & X-Ray (Paid/Settled historical invoice, PKR 6,500)
  const inv3 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-PKR-2026-003',
      patientId: patient3.id,
      patientName: patient3.name,
      patientContact: patient3.contact,
      department: 'Orthopedics & Radiology',
      description: 'Post-op physical evaluation, digital X-Ray, and immobilization splint.',
      totalAmount: 6500.0,
      paidAmount: 6500.0,
      outstandingAmount: 0.0,
      currency: 'PKR',
      status: 'PAID',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { description: 'Orthopedic Consultant OPD Inspection', quantity: 1, unitPrice: 2500.0, total: 2500.0 },
          { description: 'Digital X-Ray (2 Views, Left Leg)', quantity: 1, unitPrice: 2200.0, total: 2200.0 },
          { description: 'POP Splint Dressing & Bandages', quantity: 1, unitPrice: 1800.0, total: 1800.0 },
        ],
      },
      paymentRecords: {
        create: [
          {
            receiptNumber: 'REC-PKR-2026-0001',
            providerTxnRef: 'SAFEPAY-SETTLED-HIST-8819',
            amount: 6500.0,
            currency: 'PKR',
            gatewayMode: 'SIMULATOR',
            paymentMethod: 'Credit/Debit Card',
            receiptNotes: 'Full settlement verified upon patient discharge.',
          },
        ],
      },
    },
  });

  console.log('Seeded 3 invoices successfully:');
  console.log(`- ${inv1.invoiceNumber}: PKR ${inv1.totalAmount} (Status: ${inv1.status})`);
  console.log(`- ${inv2.invoiceNumber}: PKR ${inv2.totalAmount} (Status: ${inv2.status})`);
  console.log(`- ${inv3.invoiceNumber}: PKR ${inv3.totalAmount} (Status: ${inv3.status})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
