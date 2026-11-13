import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface SeedAccount {
  username: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'DOCTOR' | 'STAFF';
  department: string;
  designation: string;
  email: string;
  contact: string;
  doctorEmail?: string;
}

export const SEED_ACCOUNTS: SeedAccount[] = [
  // 1. Hospital Administrator (Super Admin)
  {
    username: 'admin',
    password: 'AdminPassword2026!',
    name: 'Mustajab Haider Saqib (Admin)',
    role: 'ADMIN',
    department: 'Administration',
    designation: 'Chief Hospital Administrator & System Director',
    email: 'admin@auracare-clinic.org',
    contact: '+92 300 1189114',
  },

  // 2. Doctor 1: Dr. Marcus Vance (Pediatrics)
  {
    username: 'dr.marcus',
    password: 'DoctorMarcus2026!',
    name: 'Dr. Marcus Vance, MD',
    role: 'DOCTOR',
    department: 'Pediatrics',
    designation: 'Senior Consultant Pediatrician',
    email: 'marcus.vance@clinic.org',
    contact: '+1 (555) 345-6789',
    doctorEmail: 'marcus.vance@clinic.org',
  },

  // 3. Doctor 2: Dr. Elena Rostova (Cardiology)
  {
    username: 'dr.elena',
    password: 'DoctorElena2026!',
    name: 'Dr. Elena Rostova, MD',
    role: 'DOCTOR',
    department: 'Cardiology',
    designation: 'Head of Cardiology & Inpatient Care',
    email: 'elena.rostova@clinic.org',
    contact: '+1 (555) 456-7890',
    doctorEmail: 'elena.rostova@clinic.org',
  },

  // 4. Doctor 3: Dr. Sarah Jenkins (General Practice)
  {
    username: 'dr.sarah',
    password: 'DoctorSarah2026!',
    name: 'Dr. Sarah Jenkins, MD',
    role: 'DOCTOR',
    department: 'General Practice',
    designation: 'Lead Family Physician & OPD Specialist',
    email: 'sarah.jenkins@clinic.org',
    contact: '+1 (555) 234-8901',
    doctorEmail: 'sarah.jenkins@clinic.org',
  },

  // 5. Doctor 4: Dr. David Kim (Orthopedics)
  {
    username: 'dr.david',
    password: 'DoctorDavid2026!',
    name: 'Dr. David Kim, MD',
    role: 'DOCTOR',
    department: 'Orthopedics',
    designation: 'Consultant Orthopedic Surgeon',
    email: 'david.kim@clinic.org',
    contact: '+1 (555) 567-8901',
    doctorEmail: 'david.kim@clinic.org',
  },

  // 6. Doctor 5: Dr. Anita Desai (Dermatology)
  {
    username: 'dr.anita',
    password: 'DoctorAnita2026!',
    name: 'Dr. Anita Desai, MD',
    role: 'DOCTOR',
    department: 'Dermatology',
    designation: 'Consultant Dermatologist',
    email: 'anita.desai@clinic.org',
    contact: '+1 (555) 678-9012',
    doctorEmail: 'anita.desai@clinic.org',
  },

  // 7. Department Staff: Reception Desk
  {
    username: 'reception',
    password: 'Reception2026!',
    name: 'AuraCare Front Reception Desk',
    role: 'STAFF',
    department: 'Reception',
    designation: 'Patient Intake & Triage Coordinator',
    email: 'reception@auracare-clinic.org',
    contact: '+1 (555) 000-1122',
  },

  // 8. Department Staff: Billing & Finance
  {
    username: 'billing',
    password: 'Billing2026!',
    name: 'Hospital Billing & Accounts Officer',
    role: 'STAFF',
    department: 'Billing',
    designation: 'Senior Accounts & Cashier Executive',
    email: 'billing@auracare-clinic.org',
    contact: '+1 (555) 000-3344',
  },

  // 9. Department Staff: Pharmacy & Inventory Store
  {
    username: 'pharmacy',
    password: 'Pharmacy2026!',
    name: 'Pharmacy Store Manager',
    role: 'STAFF',
    department: 'Pharmacy',
    designation: 'Senior Pharmacist & Inventory Lead',
    email: 'pharmacy@auracare-clinic.org',
    contact: '+1 (555) 000-5566',
  },
];

async function main() {
  console.log('--- Seeding System Users & Login Credentials ---');

  const doctors = await prisma.doctor.findMany();
  const doctorMap = new Map(doctors.map((d) => [d.email, d.id]));

  for (const acc of SEED_ACCOUNTS) {
    const doctorId = acc.doctorEmail ? doctorMap.get(acc.doctorEmail) : null;

    await prisma.user.upsert({
      where: { username: acc.username },
      update: {
        password: acc.password,
        name: acc.name,
        role: acc.role,
        department: acc.department,
        designation: acc.designation,
        email: acc.email,
        contact: acc.contact,
        doctorId: doctorId || undefined,
        isActive: true,
      },
      create: {
        username: acc.username,
        password: acc.password,
        name: acc.name,
        role: acc.role,
        department: acc.department,
        designation: acc.designation,
        email: acc.email,
        contact: acc.contact,
        doctorId: doctorId || undefined,
        isActive: true,
      },
    });
    console.log(`+ User provisioned: [${acc.role}] ${acc.username} (${acc.department})`);
  }

  // Generate a beautiful, readable Master Credentials file in public/MASTER_CREDENTIALS.json & .md
  const markdownReport = `# AuraCare Memorial Hospital - Master Access & Credentials Directory
**Classification:** Confidential - Hospital Administration Only  
**Generated:** ${new Date().toUTCString()}  
**System Status:** Live & Connected to Cloud Database Server  

---

## 1. System Roles & Access Matrix

| Username | Role | Department | Assigned Person / Title | Login Password | Access Scope |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **\`admin\`** | **ADMIN** | Administration | Mustajab Haider Saqib (Director) | \`AdminPassword2026!\` | Full System Access, All Departments, Credential Directory & Master Audit |
| **\`dr.marcus\`** | **DOCTOR** | Pediatrics | Dr. Marcus Vance, MD | \`DoctorMarcus2026!\` | Pediatrics Dashboard, Assigned Patients, Personal Appointment Calendar |
| **\`dr.elena\`** | **DOCTOR** | Cardiology | Dr. Elena Rostova, MD | \`DoctorElena2026!\` | Cardiology Dashboard, Cardiac Patients, Inpatient Bed Rounds, ECG/Telemetry |
| **\`dr.sarah\`** | **DOCTOR** | General Practice | Dr. Sarah Jenkins, MD | \`DoctorSarah2026!\` | General Practice Dashboard, Outpatient Appointments, Primary Care |
| **\`dr.david\`** | **DOCTOR** | Orthopedics | Dr. David Kim, MD | \`DoctorDavid2026!\` | Orthopedics Dashboard, Bone & Joint Care, Fracture & Splint Management |
| **\`dr.anita\`** | **DOCTOR** | Dermatology | Dr. Anita Desai, MD | \`DoctorAnita2026!\` | Dermatology Dashboard, Skin Clinics & Procedures |
| **\`reception\`** | **STAFF** | Reception | Front Reception & Intake Team | \`Reception2026!\` | Reception Desk, Camera Photo Intake, Patient Admittance & Registration |
| **\`billing\`** | **STAFF** | Billing & Finance | Accounts & Cashier Desk | \`Billing2026!\` | Invoices, Balance Settlement, Safepay Payment Gateway Verification |
| **\`pharmacy\`** | **STAFF** | Pharmacy & Inventory | Inventory & Store Manager | \`Pharmacy2026!\` | Medicine Inventory, Stock Reorder, Supply Thresholds |

---

## 2. Department Dashboard Routes

- **Administration / Master**: \`/admin\` & \`/\`
- **Cardiology Department**: \`/departments/cardiology\`
- **Pediatrics Department**: \`/departments/pediatrics\`
- **General Practice Department**: \`/departments/general-practice\`
- **Orthopedics Department**: \`/departments/orthopedics\`
- **Dermatology Department**: \`/departments/dermatology\`
- **Reception & Intake Desk**: \`/reception\`
- **Billing & Hospital Invoices**: \`/billing\`
- **Pharmacy & Store Inventory**: \`/inventory\`
- **Central Login Portal**: \`/login\`

---
*Note: This file is accessible to the Hospital Administrator within the Admin Dashboard with 1-click password copy and export options.*
`;

  const publicDir = path.join(process.cwd(), 'public');
  fs.writeFileSync(path.join(publicDir, 'MASTER_CREDENTIALS.md'), markdownReport, 'utf8');
  fs.writeFileSync(
    path.join(publicDir, 'MASTER_CREDENTIALS.json'),
    JSON.stringify(SEED_ACCOUNTS, null, 2),
    'utf8'
  );

  console.log('Master credentials documentation successfully created:');
  console.log('- public/MASTER_CREDENTIALS.md');
  console.log('- public/MASTER_CREDENTIALS.json');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
