import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug.toLowerCase();

    // Map URL slug to formal department specialty name
    const deptMap: { [key: string]: { name: string; doctorName: string; icon: string } } = {
      cardiology: { name: 'Cardiology', doctorName: 'Dr. Elena Rostova, MD', icon: 'Heart' },
      pediatrics: { name: 'Pediatrics', doctorName: 'Dr. Marcus Vance, MD', icon: 'Baby' },
      'general-practice': { name: 'General Practice', doctorName: 'Dr. Sarah Jenkins, MD', icon: 'Stethoscope' },
      orthopedics: { name: 'Orthopedics', doctorName: 'Dr. David Kim, MD', icon: 'Activity' },
      dermatology: { name: 'Dermatology', doctorName: 'Dr. Anita Desai, MD', icon: 'Sparkles' },
    };

    const deptInfo = deptMap[slug] || {
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      doctorName: 'Attending Physician',
      icon: 'Stethoscope',
    };

    // 1. Fetch Doctor details
    const doctor = await prisma.doctor.findFirst({
      where: {
        specialty: {
          contains: deptInfo.name,
          mode: 'insensitive',
        },
      },
    });

    // 2. Fetch Patients admitted or assigned to this department
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { doctorId: doctor?.id },
          { condition: { contains: deptInfo.name, mode: 'insensitive' } },
        ],
      },
      include: {
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Fetch Appointments for this doctor/department
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { doctorId: doctor?.id },
          { department: { contains: deptInfo.name, mode: 'insensitive' } },
        ],
      },
      orderBy: { appointmentDate: 'desc' },
    });

    // 4. Fetch Department Invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        department: { contains: deptInfo.name, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 5. Relevant Medicines in Inventory
    const inventory = await prisma.inventoryItem.findMany({
      take: 5,
    });

    return NextResponse.json({
      success: true,
      department: deptInfo.name,
      doctor,
      patients,
      appointments,
      invoices,
      inventory,
      stats: {
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        totalInvoices: invoices.length,
        revenuePKR: invoices.reduce((acc, inv) => acc + inv.paidAmount, 0),
        pendingPKR: invoices.reduce((acc, inv) => acc + inv.outstandingAmount, 0),
      },
    });
  } catch (error: any) {
    console.error('Department fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
