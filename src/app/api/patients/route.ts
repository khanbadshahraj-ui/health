import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { condition: { contains: search } },
        { contact: { contains: search } },
      ];
    }
    if (status && status !== 'All') {
      where.status = status;
    }

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: {
          select: { id: true, name: true, specialty: true },
        },
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, age, gender, contact, condition, status, doctorId, roomNumber } = body;

    let assignedDoctor = null;
    let validDocId = doctorId ? Number(doctorId) : null;
    if (validDocId) {
      const doc = await prisma.doctor.findUnique({ where: { id: validDocId } });
      if (doc) assignedDoctor = doc.name;
    }

    const newPatient = await prisma.patient.create({
      data: {
        name,
        age: Number(age) || 0,
        gender: gender || 'Other',
        contact,
        condition,
        status: status || 'Outpatient',
        doctorId: validDocId,
        assignedDoctor,
        roomNumber: roomNumber || 'Clinic Room',
      },
      include: {
        doctor: true,
      },
    });

    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error('Failed to create patient:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
