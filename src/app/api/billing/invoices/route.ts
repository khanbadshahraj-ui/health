import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        items: true,
        patient: {
          select: {
            id: true,
            name: true,
            contact: true,
            condition: true,
            roomNumber: true,
          },
        },
        paymentRecords: {
          orderBy: { verifiedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
