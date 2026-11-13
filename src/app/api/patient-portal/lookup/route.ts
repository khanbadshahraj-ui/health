import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('id') || searchParams.get('query') || '';

    if (!query || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter a Patient Hospital ID, MRN, phone number, or full name' },
        { status: 400 }
      );
    }

    const clean = query.trim();
    // Support formats like "PAT-001", "1", "001", "+92300...", or "Arthur"
    const numericPart = clean.replace(/[^0-9]/g, '');
    const numId = numericPart ? parseInt(numericPart, 10) : null;

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          numId ? { id: numId } : undefined,
          { name: { equals: clean, mode: 'insensitive' } },
          { contact: { contains: clean, mode: 'insensitive' } },
        ].filter(Boolean) as any,
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
            contact: true,
            email: true,
            avatarUrl: true,
          },
        },
        invoices: {
          include: {
            items: true,
            paymentRecords: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: `No patient medical record found for "${clean}". Please verify your issued Patient ID (e.g. PAT-001 or numeric ID) or registered mobile number.`,
        },
        { status: 404 }
      );
    }

    // Also look up any appointments booked under this patient's name or contact
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { patientName: { equals: patient.name, mode: 'insensitive' } },
          { mobileNumber: { contains: patient.contact } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedId = `PAT-${String(patient.id).padStart(4, '0')}`;

    return NextResponse.json({
      success: true,
      patient: {
        ...patient,
        patientHospitalId: formattedId,
      },
      appointments,
    });
  } catch (error: any) {
    console.error('Patient lookup error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
