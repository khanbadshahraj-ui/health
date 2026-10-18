import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createPaymentOrder, getActiveGatewayMode } from '@/lib/payments/safepay';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, idempotencyKey } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: 'invoiceId is required' },
        { status: 400 }
      );
    }

    // 1. Authoritative lookup from database - NEVER trust client amounts!
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(invoiceId, 10) },
      include: { patient: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // 2. Enforce invoice status check
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { success: false, error: 'Invoice is already fully settled and paid.' },
        { status: 400 }
      );
    }

    if (invoice.outstandingAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Outstanding amount is zero. No payment required.' },
        { status: 400 }
      );
    }

    // 3. Idempotency check: If an attempt with this idempotency key already exists and is pending, return it
    if (idempotencyKey) {
      const existingAttempt = await prisma.paymentAttempt.findUnique({
        where: { idempotencyKey },
      });
      if (existingAttempt && existingAttempt.status === 'PENDING' && existingAttempt.checkoutUrl) {
        return NextResponse.json({
          success: true,
          data: {
            attemptId: existingAttempt.attemptId,
            checkoutUrl: existingAttempt.checkoutUrl,
            trackerToken: existingAttempt.trackerToken,
            mode: existingAttempt.gatewayMode,
            amount: existingAttempt.amount,
            currency: existingAttempt.currency,
            reused: true,
          },
        });
      }
    }

    const attemptId = `att_${crypto.randomBytes(10).toString('hex')}`;
    const payableAmount = invoice.outstandingAmount;
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const redirectUrl = `${origin}/billing/${invoice.id}?attemptId=${attemptId}`;
    const cancelUrl = `${origin}/billing/${invoice.id}?attemptId=${attemptId}&cancelled=true`;

    // 4. Create Payment Order with gateway / simulator
    const order = await createPaymentOrder({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: payableAmount,
      currency: invoice.currency,
      clientName: invoice.patientName,
      clientPhone: invoice.patientContact,
      cancelUrl,
      redirectUrl,
    });

    // 5. Store Payment Attempt in database separate from invoice settlement
    const paymentAttempt = await prisma.paymentAttempt.create({
      data: {
        attemptId,
        invoiceId: invoice.id,
        idempotencyKey: idempotencyKey || attemptId,
        amount: payableAmount,
        currency: invoice.currency,
        provider: order.mode === 'SANDBOX' ? 'SAFEPAY' : 'SIMULATOR',
        gatewayMode: order.mode,
        trackerToken: order.trackerToken,
        status: 'PENDING',
        checkoutUrl: order.checkoutUrl,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        attemptId: paymentAttempt.attemptId,
        checkoutUrl: order.checkoutUrl,
        trackerToken: order.trackerToken,
        mode: order.mode,
        amount: payableAmount,
        currency: invoice.currency,
      },
    });
  } catch (error: any) {
    console.error('Error initiating payment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
