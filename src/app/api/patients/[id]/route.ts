import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { name, age, gender, contact, condition, status, doctorId, roomNumber } = body;

    let assignedDoctor = undefined;
    let validDocId = doctorId !== undefined ? (doctorId ? Number(doctorId) : null) : undefined;
    if (validDocId) {
      const doc = await prisma.doctor.findUnique({ where: { id: validDocId } });
      if (doc) assignedDoctor = doc.name;
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(age !== undefined && { age: Number(age) }),
        ...(gender && { gender }),
        ...(contact && { contact }),
        ...(condition && { condition }),
        ...(status && { status }),
        ...(validDocId !== undefined && { doctorId: validDocId }),
        ...(assignedDoctor && { assignedDoctor }),
        ...(roomNumber !== undefined && { roomNumber }),
      },
      include: {
        doctor: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update patient:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    await prisma.patient.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Patient removed' });
  } catch (error) {
    console.error('Failed to delete patient:', error);
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
}
