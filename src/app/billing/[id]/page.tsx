'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Building,
  Calendar,
  User,
  Phone,
  FileCheck,
  Clock,
  Printer,
  ChevronRight,
  ExternalLink,
  Lock,
} from 'lucide-react';

function InvoiceDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/billing/invoices/${invoiceId}`);
      const data = await res.json();
      if (data.success) {
        setInvoice(data.data);
      } else {
        setBannerMessage({ type: 'error', text: data.error || 'Failed to load invoice' });
      }
    } catch (e: any) {
      setBannerMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  // Handle return redirect from payment sandbox or simulator
  useEffect(() => {
    const attemptId = searchParams.get('attemptId');
    const cancelled = searchParams.get('cancelled');
    const tracker = searchParams.get('tracker');
    const simStatus = searchParams.get('sim_status');

    if (cancelled) {
      setBannerMessage({
        type: 'error',
        text: 'Payment was cancelled or dismissed. No changes were made to the invoice.',
      });
      return;
    }

    if (attemptId && !verifying) {
      verifyAttempt(attemptId, tracker, simStatus);
    }
  }, [searchParams]);

  const verifyAttempt = async (attemptId: string, tracker?: string | null, simStatus?: string | null) => {
    setVerifying(true);
    setBannerMessage({
      type: 'info',
      text: 'Verifying payment authoritative settlement with gateway...',
    });

    try {
      const res = await fetch('/api/billing/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          trackerToken: tracker || undefined,
          simulatedStatus: simStatus || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBannerMessage({
          type: 'success',
          text: `Payment successfully verified! Receipt: ${data.data.receiptNumber || 'Issued'}. Invoice settled.`,
        });
        await fetchInvoice();
      } else {
        setBannerMessage({
          type: 'error',
          text: `Verification notice: ${data.error || 'Payment not verified.'}`,
        });
        await fetchInvoice();
      }
    } catch (e: any) {
      setBannerMessage({
        type: 'error',
        text: `Error verifying settlement: ${e.message}`,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handlePayOnline = async () => {
    if (!invoice || invoice.status === 'PAID') return;
    setPaying(true);
    setBannerMessage(null);

    try {
      // Unique idempotency key to prevent double charging
      const idempotencyKey = `pay_${invoice.id}_${Date.now()}`;
      const res = await fetch('/api/billing/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.data.checkoutUrl) {
        // Authoritative checkout URL (Safepay Hosted Sandbox or Local Payment Simulator)
        window.location.href = data.data.checkoutUrl;
      } else {
        setBannerMessage({
          type: 'error',
          text: data.error || 'Failed to create payment checkout session.',
        });
        setPaying(false);
      }
    } catch (e: any) {
      setBannerMessage({
        type: 'error',
        text: `Checkout request failed: ${e.message}`,
      });
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <Clock className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
        Loading hospital invoice details...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-12 text-center text-slate-600">
        <AlertCircle className="w-8 h-8 mx-auto text-rose-500 mb-3" />
        <h2 className="text-xl font-bold">Invoice Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">The requested invoice could not be located in the database.</p>
        <Link href="/billing" className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Billing
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/billing"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Invoice
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : bannerMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {bannerMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {bannerMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          {bannerMessage.type === 'info' && <Clock className="w-5 h-5 text-blue-600 shrink-0 animate-spin" />}
          <span>{bannerMessage.text}</span>
        </div>
      )}

      {/* Invoice Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <Building className="w-4 h-4" /> AuraCare Memorial Hospital, Pakistan
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-mono">{invoice.invoiceNumber}</h1>
            <p className="text-emerald-100 text-sm">{invoice.department} • Medical Care Invoice</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right md:min-w-[220px]">
            <span className="text-xs uppercase text-emerald-200 font-semibold tracking-wider block">
              Outstanding Balance
            </span>
            <div className="text-3xl font-extrabold text-white mt-0.5">
              PKR {invoice.outstandingAmount.toLocaleString()}
            </div>
            <div className="mt-1">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  invoice.status === 'PAID'
                    ? 'bg-emerald-400 text-emerald-950'
                    : invoice.status === 'PARTIALLY_PAID'
                    ? 'bg-amber-300 text-amber-950'
                    : 'bg-rose-400 text-rose-950'
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Patient & Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Patient Details</h3>
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <User className="w-4 h-4 text-emerald-600" /> {invoice.patientName}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" /> {invoice.patientContact}
            </div>
            {invoice.patient?.roomNumber && (
              <div className="text-xs text-slate-500 font-medium">
                Assigned Unit: <span className="font-semibold text-slate-700">{invoice.patient.roomNumber}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 md:text-right">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Invoice Metadata</h3>
            <div className="text-sm text-slate-600">
              Billing Date:{' '}
              <span className="font-semibold text-slate-800">
                {new Date(invoice.createdAt).toLocaleDateString('en-PK', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="text-sm text-slate-600">
              Currency:{' '}
              <span className="font-semibold text-slate-800">PKR (Pakistani Rupee)</span>
            </div>
            <div className="text-xs text-slate-400">
              Secured with Safepay Developer Sandbox & SHA256 Verification
            </div>
          </div>
        </div>

        {/* Itemized Services Table */}
        <div className="p-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Itemized Clinical Services & Hospital Charges
          </h3>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price (PKR)</th>
                  <th className="py-3 px-4 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-medium text-slate-800">{item.description}</td>
                      <td className="py-3.5 px-4 text-center text-slate-600">{item.quantity}</td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                        {item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 text-center text-slate-400">
                      General medical services fee.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50/70 border-t border-slate-200 font-semibold text-slate-800">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-right">Total Invoice Bill:</td>
                  <td className="py-3 px-4 text-right text-slate-900 font-bold">
                    PKR {invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-2.5 px-4 text-right text-emerald-700">Authoritatively Paid:</td>
                  <td className="py-2.5 px-4 text-right text-emerald-700 font-bold">
                    PKR {invoice.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="border-t border-slate-200 text-base">
                  <td colSpan={3} className="py-3 px-4 text-right text-slate-900 font-extrabold">Net Payable Balance:</td>
                  <td className="py-3 px-4 text-right text-amber-700 font-extrabold">
                    PKR {invoice.outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment CTA Section */}
        {invoice.status !== 'PAID' ? (
          <div className="p-8 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border-t border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Pay Online — Safepay Pakistan Sandbox
              </div>
              <p className="text-xs text-slate-600 max-w-xl">
                Transactions are authorized in sandbox mode. Outstanding amount (PKR{' '}
                {invoice.outstandingAmount.toLocaleString()}) is verified server-side. Cards, EasyPaisa, and JazzCash
                supported.
              </p>
            </div>

            <button
              onClick={handlePayOnline}
              disabled={paying || verifying}
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-3 shrink-0"
            >
              {paying ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Initiating Sandbox Checkout...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay PKR {invoice.outstandingAmount.toLocaleString()} — Sandbox
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-8 bg-emerald-50 border-t border-emerald-100 flex items-center gap-4 text-emerald-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-base">Invoice Fully Settled</h4>
              <p className="text-xs text-emerald-700">
                This invoice has zero outstanding balance. All medical charges have been settled and authoritatively verified.
              </p>
            </div>
          </div>
        )}

        {/* Official Receipts & Payment History */}
        {invoice.paymentRecords && invoice.paymentRecords.length > 0 && (
          <div className="p-8 border-t border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" /> Authoritative Settlement Records
            </h3>
            <div className="space-y-3">
              {invoice.paymentRecords.map((rec: any) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-mono font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {rec.receiptNumber}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Txn Ref: <span className="font-mono text-slate-700">{rec.providerTxnRef}</span> • Method: {rec.paymentMethod}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Verified at: {new Date(rec.verifiedAt).toLocaleString()} ({rec.gatewayMode})
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-emerald-700">
                      PKR {rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      Settled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoiceDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500">
          <Clock className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
          Loading invoice details...
        </div>
      }
    >
      <InvoiceDetailContent />
    </Suspense>
  );
}

