import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Read the master markdown documentation file
    const mdPath = path.join(process.cwd(), 'public', 'MASTER_CREDENTIALS.md');
    let markdownContent = '';
    if (fs.existsSync(mdPath)) {
      markdownContent = fs.readFileSync(mdPath, 'utf8');
    }

    // Query live users from Neon PostgreSQL
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
            availability: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      users,
      markdownContent,
      fileDownloadUrl: '/MASTER_CREDENTIALS.md',
      jsonDownloadUrl: '/MASTER_CREDENTIALS.json',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
