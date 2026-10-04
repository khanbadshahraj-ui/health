import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { name, category, stock, unitPrice, minThreshold } = body;

    const existing = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const newStock = stock !== undefined ? Number(stock) : existing.stock;
    const threshold = minThreshold !== undefined ? Number(minThreshold) : existing.minThreshold;

    let newStatus = 'In Stock';
    if (newStock === 0) {
      newStatus = 'Out of Stock';
    } else if (newStock <= threshold) {
      newStatus = 'Low Stock';
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        stock: newStock,
        ...(unitPrice !== undefined && { unitPrice: Number(unitPrice) }),
        minThreshold: threshold,
        status: newStatus,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update inventory item:', error);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { delta } = body; // e.g. +10 or -5

    const existing = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const calculatedStock = Math.max(0, existing.stock + Number(delta));
    let newStatus = 'In Stock';
    if (calculatedStock === 0) {
      newStatus = 'Out of Stock';
    } else if (calculatedStock <= existing.minThreshold) {
      newStatus = 'Low Stock';
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        stock: calculatedStock,
        status: newStatus,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to adjust stock:', error);
    return NextResponse.json({ error: 'Failed to adjust stock' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    await prisma.inventoryItem.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Failed to delete item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
