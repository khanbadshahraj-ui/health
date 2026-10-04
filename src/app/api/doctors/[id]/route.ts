import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { name, specialty, availability, contact, email, experience } = body;

    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(specialty && { specialty }),
        ...(availability && { availability }),
        ...(contact && { contact }),
        ...(email && { email }),
        ...(experience && { experience }),
      },
    });

    return NextResponse.json(doctor);
  } catch (error) {
    console.error('Failed to update doctor:', error);
    return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 });
  }
}
