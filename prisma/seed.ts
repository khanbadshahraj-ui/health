import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.inventoryItem.deleteMany();

  console.log('Seeding 5 Doctors...');
  const doctors = await Promise.all([
    prisma.doctor.create({
      data: {
        name: 'Dr. Sarah Jenkins, MD',
        specialty: 'General Practice',
        availability: 'On Duty',
        contact: '+1 (555) 234-8901',
        email: 'sarah.jenkins@clinic.org',
        experience: '12 years',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Marcus Vance, MD',
        specialty: 'Pediatrics',
        availability: 'On Duty',
        contact: '+1 (555) 345-6789',
        email: 'marcus.vance@clinic.org',
        experience: '9 years',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Elena Rostova, MD',
        specialty: 'Cardiology',
        availability: 'On Call',
        contact: '+1 (555) 456-7890',
        email: 'elena.rostova@clinic.org',
        experience: '15 years',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813511-094191c964e5?auto=format&fit=crop&q=80&w=300',
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. David Kim, MD',
        specialty: 'Orthopedics',
        availability: 'On Duty',
        contact: '+1 (555) 567-8901',
        email: 'david.kim@clinic.org',
        experience: '11 years',
        avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Anita Desai, MD',
        specialty: 'Dermatology',
        availability: 'Off Duty',
        contact: '+1 (555) 678-9012',
        email: 'anita.desai@clinic.org',
        experience: '8 years',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
      },
    }),
  ]);

  console.log('Seeding 5 Patients...');
  await Promise.all([
    prisma.patient.create({
      data: {
        name: 'Arthur Pendelton',
        age: 64,
        gender: 'Male',
        contact: '+1 (555) 111-2233',
        condition: 'Hypertension & Type 2 Diabetes',
        status: 'Admitted',
        doctorId: doctors[0].id,
        assignedDoctor: doctors[0].name,
        roomNumber: 'Suite 104',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Maya Lin Chen',
        age: 8,
        gender: 'Female',
        contact: '+1 (555) 222-3344',
        condition: 'Acute Bronchitis',
        status: 'Outpatient',
        doctorId: doctors[1].id,
        assignedDoctor: doctors[1].name,
        roomNumber: 'Pediatrics Exam 2',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Robert Thornton',
        age: 52,
        gender: 'Male',
        contact: '+1 (555) 333-4455',
        condition: 'Post-Stent Cardiac Observation',
        status: 'Recovering',
        doctorId: doctors[2].id,
        assignedDoctor: doctors[2].name,
        roomNumber: 'Cardiac Recovery B',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Sophia Rodriguez',
        age: 29,
        gender: 'Female',
        contact: '+1 (555) 444-5566',
        condition: 'Grade II Ankle Sprain & Contusion',
        status: 'Outpatient',
        doctorId: doctors[3].id,
        assignedDoctor: doctors[3].name,
        roomNumber: 'Rehab Rm 1',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'George Gallagher',
        age: 43,
        gender: 'Male',
        contact: '+1 (555) 555-6677',
        condition: 'Severe Allergic Contact Dermatitis',
        status: 'Under Observation',
        doctorId: doctors[4].id,
        assignedDoctor: doctors[4].name,
        roomNumber: 'Clinic Ward 3',
      },
    }),
  ]);

  console.log('Seeding 5 Inventory Items...');
  await Promise.all([
    prisma.inventoryItem.create({
      data: {
        name: 'Paracetamol 500mg Tablets (100s)',
        category: 'Medicine',
        stock: 150,
        unitPrice: 8.50,
        minThreshold: 30,
        status: 'In Stock',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Sterile Syringes 5ml (Box of 50)',
        category: 'Consumables',
        stock: 12,
        unitPrice: 16.20,
        minThreshold: 25,
        status: 'Low Stock',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Elastic Gauze Bandages 4" (Pack of 12)',
        category: 'Supplies',
        stock: 45,
        unitPrice: 12.00,
        minThreshold: 15,
        status: 'In Stock',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Amoxicillin 250mg Suspension',
        category: 'Medicine',
        stock: 8,
        unitPrice: 14.75,
        minThreshold: 20,
        status: 'Low Stock',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Digital Infrared Thermometer',
        category: 'Equipment',
        stock: 22,
        unitPrice: 42.00,
        minThreshold: 5,
        status: 'In Stock',
      },
    }),
  ]);

  console.log('Seeding complete! Exactly 5 Doctors, 5 Patients, and 5 Inventory Items created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
