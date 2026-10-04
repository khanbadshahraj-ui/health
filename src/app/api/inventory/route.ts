import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (search) {
      where.name = { contains: search };
    }
    if (category && category !== 'All') {
      where.category = category;
    }
    if (status && status !== 'All') {
      where.status = status;
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: { stock: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, stock, unitPrice, minThreshold } = body;

    const stockNum = Number(stock) || 0;
    const thresholdNum = Number(minThreshold) || 15;
    let status = 'In Stock';
    if (stockNum === 0) {
      status = 'Out of Stock';
    } else if (stockNum <= thresholdNum) {
      status = 'Low Stock';
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category: category || 'General',
        stock: stockNum,
        unitPrice: Number(unitPrice) || 0,
        minThreshold: thresholdNum,
        status,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to create inventory item:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
