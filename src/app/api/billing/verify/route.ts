import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPaymentTracker } from '@/lib/payments/safepay';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { attemptId, trackerToken, simulatedStatus, paymentMethod } = body;

    if (!attemptId && !trackerToken) {
      return NextResponse.json(
        { success: false, error: 'attemptId or trackerToken is required' },
        { status: 400 }
      );
    }

    // 1. Find the payment attempt
    const attempt = await prisma.paymentAttempt.findFirst({
      where: attemptId ? { attemptId } : { trackerToken },
      include: {
        invoice: true,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, error: 'Payment attempt not found' },
        { status: 404 }
      );
    }

    // 2. Idempotency & Replay prevention:
    // If already completed and settled, return existing payment record without duplicate settlement!
    if (attempt.status === 'COMPLETED') {
      const existingRecord = await prisma.paymentRecord.findFirst({
        where: { attemptId: attempt.attemptId },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment already verified and settled.',
        data: {
          verified: true,
          status: 'PAID',
          invoiceId: attempt.invoiceId,
          receiptNumber: existingRecord?.receiptNumber,
          outstandingAmount: attempt.invoice.outstandingAmount,
          alreadySettled: true,
        },
      });
    }

    const invoice = attempt.invoice;
    const tokenToVerify = trackerToken || attempt.trackerToken;

    if (!tokenToVerify) {
      return NextResponse.json(
        { success: false, error: 'No tracker token associated with this attempt' },
        { status: 400 }
      );
    }

    // 3. Authoritative verification with Safepay or Simulator
    const verification = await verifyPaymentTracker(
      tokenToVerify,
      attempt.amount,
      attempt.currency,
      simulatedStatus
    );

    // If cancelled or failed
    if (!verification.verified || verification.status !== 'PAID') {
      const newStatus = verification.status === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
      await prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: newStatus,
          errorMessage: verification.error || `Payment ${newStatus.toLowerCase()}`,
        },
      });

      return NextResponse.json({
        success: false,
        error: verification.error || `Payment verification returned status: ${verification.status}`,
        data: {
          verified: false,
          status: newStatus,
          invoiceId: invoice.id,
        },
      });
    }

    // 4. Atomic settlement update inside a Prisma interactive transaction
    const result = await prisma.$transaction(async (tx) => {
      // Re-fetch current invoice within transaction to lock/prevent race conditions
      const currentInvoice = await tx.invoice.findUnique({
        where: { id: invoice.id },
      });

      if (!currentInvoice) {
        throw new Error('Invoice not found during settlement');
      }

      // Check if invoice was already paid by concurrent callback
      if (currentInvoice.status === 'PAID') {
        return {
          invoice: currentInvoice,
          receiptNumber: null,
          alreadyPaid: true,
        };
      }

      const verifiedSettledAmount = verification.amount;
      const newPaidAmount = Math.round((currentInvoice.paidAmount + verifiedSettledAmount) * 100) / 100;
      const newOutstanding = Math.max(0, Math.round((currentInvoice.totalAmount - newPaidAmount) * 100) / 100);
      const newInvoiceStatus = newOutstanding <= 0.01 ? 'PAID' : 'PARTIALLY_PAID';

      // Update invoice balances
      const updatedInvoice = await tx.invoice.update({
        where: { id: currentInvoice.id },
        data: {
          paidAmount: newPaidAmount,
          outstandingAmount: newOutstanding,
          status: newInvoiceStatus,
        },
      });

      // Update attempt to COMPLETED
      await tx.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'COMPLETED',
          paymentMethod: paymentMethod || 'Credit/Debit Card (Sandbox)',
          completedAt: new Date(),
        },
      });

      // Generate immutable receipt number
      const receiptNumber = `REC-PKR-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // Create authoritative ledger record
      const paymentRecord = await tx.paymentRecord.create({
        data: {
          receiptNumber,
          invoiceId: currentInvoice.id,
          attemptId: attempt.attemptId,
          providerTxnRef: verification.reference,
          amount: verifiedSettledAmount,
          currency: verification.currency,
          gatewayMode: verification.mode,
          paymentMethod: paymentMethod || 'Online (Safepay Sandbox)',
          receiptNotes: `Authoritatively verified via ${verification.mode}. Reference: ${verification.reference}`,
        },
      });

      return {
        invoice: updatedInvoice,
        receiptNumber: paymentRecord.receiptNumber,
        record: paymentRecord,
        alreadyPaid: false,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and settled successfully.',
      data: {
        verified: true,
        status: 'PAID',
        invoiceId: result.invoice.id,
        invoiceNumber: result.invoice.invoiceNumber,
        receiptNumber: result.receiptNumber,
        paidAmount: result.invoice.paidAmount,
        outstandingAmount: result.invoice.outstandingAmount,
        invoiceStatus: result.invoice.status,
      },
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
