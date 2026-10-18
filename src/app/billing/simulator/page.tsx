'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Lock,
  Building,
} from 'lucide-react';

function SimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tracker = searchParams.get('tracker') || '';
  const invoiceId = searchParams.get('invoiceId') || '';
  const invoiceNumber = searchParams.get('invoiceNumber') || '';
  const amount = searchParams.get('amount') || '0.00';
  const currency = searchParams.get('currency') || 'PKR';
  const redirectUrl = searchParams.get('redirectUrl') || `/billing/${invoiceId}`;
  const cancelUrl = searchParams.get('cancelUrl') || `/billing/${invoiceId}?cancelled=true`;

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'easypaisa' | 'jazzcash'>('card');
  const [outcome, setOutcome] = useState<'PAID' | 'FAILED' | 'CANCELLED'>('PAID');
  const [processing, setProcessing] = useState(false);

  // Form mock values
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [walletPhone, setWalletPhone] = useState('+92 300 1234567');

  const handleSubmit = () => {
    setProcessing(true);

    setTimeout(() => {
      if (outcome === 'CANCELLED') {
        const url = new URL(cancelUrl, window.location.origin);
        url.searchParams.set('tracker', tracker);
        url.searchParams.set('sim_status', 'CANCELLED');
        window.location.href = url.toString();
        return;
      }

      const url = new URL(redirectUrl, window.location.origin);
      url.searchParams.set('tracker', tracker);
      url.searchParams.set('sim_status', outcome);
      url.searchParams.set('method', paymentMethod);
      window.location.href = url.toString();
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Simulator Banner */}
        <div className="bg-amber-500 text-slate-950 px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Local Payment Gateway Simulator
          </span>
          <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[10px]">
            Safepay Protocol Emulation
          </span>
        </div>

        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">AuraCare Hospital Checkout</h2>
              <p className="text-xs text-slate-500">Invoice: {invoiceNumber || 'INV-TEST'}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase text-slate-400 font-semibold block">Total Payable</span>
            <div className="text-lg font-black text-emerald-700">
              {currency} {parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Method Selection */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
              Choose Payment Instrument (Pakistan)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-bold">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('easypaisa')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'easypaisa'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">EasyPaisa</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('jazzcash')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'jazzcash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5 text-rose-600" />
                <span className="text-xs font-bold">JazzCash</span>
              </button>
            </div>
          </div>

          {/* Instrument Input Mock */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            {paymentMethod === 'card' ? (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">Test Card Number</label>
                  <input
                    type="text"
                    disabled
                    value={cardNumber}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">Expiry</label>
                    <input
                      type="text"
                      disabled
                      value="12/28"
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">CVC</label>
                    <input
                      type="text"
                      disabled
                      value="•••"
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase">
                  Mobile Wallet Account Number
                </label>
                <input
                  type="text"
                  value={walletPhone}
                  onChange={(e) => setWalletPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Test Simulation Controls */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Select Test Gateway Response
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  outcome === 'PAID' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="outcome"
                    value="PAID"
                    checked={outcome === 'PAID'}
                    onChange={() => setOutcome('PAID')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Simulate Successful Payment</span>
                    <span className="text-[11px] text-slate-500">
                      Returns authorized token, triggers server settlement
                    </span>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </label>

              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  outcome === 'FAILED' ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="outcome"
                    value="FAILED"
                    checked={outcome === 'FAILED'}
                    onChange={() => setOutcome('FAILED')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Simulate Declined / Card Error</span>
                    <span className="text-[11px] text-slate-500">
                      Returns failed state, preserves invoice balance
                    </span>
                  </div>
                </div>
                <XCircle className="w-4 h-4 text-rose-600" />
              </label>

              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  outcome === 'CANCELLED' ? 'border-slate-400 bg-slate-100/60' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="outcome"
                    value="CANCELLED"
                    checked={outcome === 'CANCELLED'}
                    onChange={() => setOutcome('CANCELLED')}
                    className="text-slate-600 focus:ring-slate-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Simulate User Cancellation</span>
                    <span className="text-[11px] text-slate-500">User hits cancel on checkout screen</span>
                  </div>
                </div>
                <AlertTriangle className="w-4 h-4 text-slate-400" />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={processing}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                'Processing simulated response...'
              ) : (
                <>
                  Confirm {outcome === 'PAID' ? 'Payment' : outcome} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              type="button"
              disabled={processing}
              onClick={() => {
                setOutcome('CANCELLED');
                handleSubmit();
              }}
              className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
            >
              Dismiss
            </button>
          </div>

          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3" /> 256-Bit SSL Encrypted Sandbox Test Channel
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="text-white text-sm">Loading Simulator...</div>
        </div>
      }
    >
      <SimulatorContent />
    </Suspense>
  );
}

