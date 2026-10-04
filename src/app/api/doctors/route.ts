import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty') || '';
    const availability = searchParams.get('availability') || '';

    const where: any = {};
    if (specialty && specialty !== 'All') {
      where.specialty = specialty;
    }
    if (availability && availability !== 'All') {
      where.availability = availability;
    }

    const doctors = await prisma.doctor.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { patients: true },
        },
      },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, specialty, availability, contact, email, experience, avatarUrl } = body;

    const doctor = await prisma.doctor.create({
      data: {
        name,
        specialty,
        availability: availability || 'On Duty',
        contact,
        email,
        experience: experience || '5 years',
        avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=059669&color=fff`,
      },
    });

    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    console.error('Failed to create doctor:', error);
    return NextResponse.json({ error: 'Failed to create doctor' }, { status: 500 });
  }
}
