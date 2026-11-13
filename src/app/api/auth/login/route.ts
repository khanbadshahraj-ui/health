import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // Authoritative lookup in Neon PostgreSQL
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: cleanUsername,
          mode: 'insensitive',
        },
      },
      include: {
        doctor: true,
      },
    });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated. Contact hospital administration.' },
        { status: 403 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Determine default landing dashboard based on department & role
    let redirectUrl = '/';
    if (user.role === 'ADMIN') {
      redirectUrl = '/admin';
    } else if (user.role === 'DOCTOR') {
      const deptSlug = user.department.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      redirectUrl = `/departments/${deptSlug}`;
    } else if (user.department === 'Reception') {
      redirectUrl = '/reception';
    } else if (user.department === 'Billing') {
      redirectUrl = '/billing';
    } else if (user.department === 'Pharmacy') {
      redirectUrl = '/inventory';
    }

    const sessionUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
      designation: user.designation,
      email: user.email,
      doctorId: user.doctorId,
      doctor: user.doctor,
    };

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      redirectUrl,
    });

    // Set HTTP-only compatible session cookie
    response.cookies.set('auracare_auth', JSON.stringify(sessionUser), {
      httpOnly: false, // Accessible to client-side auth state
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('auracare_auth', '', {
    path: '/',
    maxAge: 0,
  });
  return response;
}
