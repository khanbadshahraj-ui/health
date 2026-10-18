import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySafepayWebhookSignature } from '@/lib/payments/safepay';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-sfpy-signature');

    // 1. Verify Webhook HMAC-SHA256 signature if secret is configured
    if (process.env.SAFEPAY_WEBHOOK_SECRET) {
      const isValid = verifySafepayWebhookSignature(rawBody, signature);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event || payload.type;
    const data = payload.data || {};

    const trackerToken = data.token || data.tracker;
    if (!trackerToken) {
      return NextResponse.json({ success: false, error: 'No tracker token in webhook payload' }, { status: 400 });
    }

    // 2. Find payment attempt
    const attempt = await prisma.paymentAttempt.findFirst({
      where: { trackerToken },
      include: { invoice: true },
    });

    if (!attempt) {
      // Return 200 to acknowledge webhook even if attempt is not found locally
      return NextResponse.json({ success: true, message: 'Attempt not found locally; ignored' });
    }

    // 3. Idempotent check: if already completed, do nothing
    if (attempt.status === 'COMPLETED') {
      return NextResponse.json({ success: true, message: 'Already settled; webhook ignored idempotently' });
    }

    const status = (data.state || data.status || '').toUpperCase();

    if (status === 'PAID' || status === 'COMPLETED' || eventType === 'payment.completed') {
      const verifiedAmount = parseFloat(data.amount || attempt.amount);

      // Verify amount matches
      if (Math.abs(verifiedAmount - attempt.amount) > 0.01) {
        return NextResponse.json({ success: false, error: 'Amount mismatch in webhook' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        const inv = await tx.invoice.findUnique({ where: { id: attempt.invoiceId } });
        if (!inv || inv.status === 'PAID') return;

        const newPaid = Math.round((inv.paidAmount + verifiedAmount) * 100) / 100;
        const newOutstanding = Math.max(0, Math.round((inv.totalAmount - newPaid) * 100) / 100);

        await tx.invoice.update({
          where: { id: inv.id },
          data: {
            paidAmount: newPaid,
            outstandingAmount: newOutstanding,
            status: newOutstanding <= 0.01 ? 'PAID' : 'PARTIALLY_PAID',
          },
        });

        await tx.paymentAttempt.update({
          where: { id: attempt.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        const receiptNumber = `REC-PKR-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        await tx.paymentRecord.create({
          data: {
            receiptNumber,
            invoiceId: inv.id,
            attemptId: attempt.attemptId,
            providerTxnRef: data.token || trackerToken,
            amount: verifiedAmount,
            currency: attempt.currency,
            gatewayMode: attempt.gatewayMode,
            paymentMethod: 'Safepay Webhook Settlement',
            receiptNotes: `Settled via authoritative server-to-server webhook event: ${eventType}`,
          },
        });
      });
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
