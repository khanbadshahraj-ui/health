import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [totalPatients, totalDoctors, onDutyDoctors, lowStockItems, totalInventory] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.doctor.count({
        where: {
          availability: 'On Duty',
        },
      }),
      prisma.inventoryItem.count({
        where: {
          stock: {
            lte: 15,
          },
        },
      }),
      prisma.inventoryItem.count(),
    ]);

    const recentPatients = await prisma.patient.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: {
          select: { name: true, specialty: true },
        },
      },
    });

    const doctors = await prisma.doctor.findMany({
      take: 5,
      orderBy: { name: 'asc' },
    });

    const lowStockAlerts = await prisma.inventoryItem.findMany({
      where: {
        stock: {
          lte: 15,
        },
      },
      take: 4,
      orderBy: { stock: 'asc' },
    });

    return NextResponse.json({
      metrics: {
        totalPatients,
        totalDoctors,
        onDutyDoctors,
        lowStockItems,
        totalInventory,
      },
      recentPatients,
      doctors,
      lowStockAlerts,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
