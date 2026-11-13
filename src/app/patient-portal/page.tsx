'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import {
  FileText,
  Search,
  User,
  Phone,
  Calendar,
  Clock,
  Stethoscope,
  Building,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Printer,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Lock,
  HeartPulse,
} from 'lucide-react';

export default function PatientPortalPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/patient-portal/lookup?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.success && data.patient) {
        setResult(data);
      } else {
        setError(data.error || 'Medical record not found. Please verify your issued Patient ID.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error looking up patient record');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleFill = (sampleId: string) => {
    setQuery(sampleId);
    // automatically trigger lookup
    setTimeout(() => {
      fetch(`/api/patient-portal/lookup?query=${encodeURIComponent(sampleId)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setResult(d);
          else setError(d.error);
        });
    }, 50);
  };

  const patient = result?.patient;
  const appointments = result?.appointments || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Patient Medical Portal & Treatment History"
        subtitle="Lookup your hospital treatment record, physician consultations, and clinical invoices using your issued Patient ID"
      />

      <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Search Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Access Your Clinical Health Record
                </h2>
                <p className="text-xs text-slate-500">
                  Enter your issued Patient ID (e.g. <span className="font-mono font-bold text-emerald-700">PAT-0001</span>), numeric ID, or mobile number
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Patient ID (e.g. PAT-0001, PAT-0004) or Registered Phone"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Retrieving Record...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Find Treatment History</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo ID presets */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Quick Test Records:</span>
            <button
              type="button"
              onClick={() => handleSampleFill('PAT-0001')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono font-bold transition border border-emerald-200/60"
            >
              PAT-0001 (Robert Thornton - Cardiac)
            </button>
            <button
              type="button"
              onClick={() => handleSampleFill('PAT-0004')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono font-bold transition border border-emerald-200/60"
            >
              PAT-0004 (Arthur Pendelton - General)
            </button>
            <button
              type="button"
              onClick={() => handleSampleFill('PAT-0006')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono font-bold transition border border-emerald-200/60"
            >
              PAT-0006 (Tariq Mehmood)
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Patient Record Display */}
        {patient && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-200">
            {/* Header Badge */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-2xl text-emerald-300 shrink-0 overflow-hidden">
                  {patient.photoUrl ? (
                    <img src={patient.photoUrl} alt={patient.name} className="w-full h-full object-cover" />
                  ) : (
                    patient.name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                      {patient.patientHospitalId}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-semibold uppercase">
                      {patient.status}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">{patient.name}</h1>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    {patient.age} yrs • {patient.gender} • Admitted: {new Date(patient.admittedDate || patient.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 md:text-right">
                <span className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold block">
                  Assigned Unit / Room
                </span>
                <div className="text-lg font-extrabold text-white">
                  {patient.roomNumber || 'Outpatient Clinic'}
                </div>
                <div className="text-xs text-emerald-100 font-medium mt-0.5">
                  Dr: {patient.doctor?.name || patient.assignedDoctor || 'On Duty Physician'}
                </div>
              </div>
            </div>

            {/* Medical Diagnosis & Treatment Details Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Clinical Diagnosis & Current Treatment
                </h3>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                  <Stethoscope className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{patient.condition}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Assigned to {patient.doctor?.specialty || 'General'} clinical care. Active medical management with regular telemetry and physician rounds.
                    </p>
                  </div>
                </div>
              </div>

              {/* Consultation History */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Consultation Appointments & Verification OTPs
                </h3>
                {appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map((app: any) => (
                      <div
                        key={app.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-900">{app.bookingCode}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              {app.consultationType}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            With <span className="font-semibold text-slate-800">{app.doctorName}</span> on {app.appointmentDate} at {app.timeSlot}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-auto">
                          <div className="p-2 px-3 rounded-xl bg-white border border-slate-200 text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation OTP</span>
                            <span className="font-mono text-sm font-black text-emerald-700">{app.otpCode}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-500 text-center">
                    No advance online bookings recorded. Walk-in hospital registration.
                  </div>
                )}
              </div>

              {/* Invoices & Medical Billing Records */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Hospital Invoices & Billing Settlement (PKR)
                </h3>
                {patient.invoices && patient.invoices.length > 0 ? (
                  <div className="space-y-3">
                    {patient.invoices.map((inv: any) => (
                      <div
                        key={inv.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 font-mono font-bold text-xs text-slate-900">
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{inv.invoiceNumber}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                inv.status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-1">{inv.description}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-extrabold text-slate-900">
                            PKR {inv.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-[11px] font-semibold text-emerald-700">
                            Paid: PKR {inv.paidAmount.toLocaleString()} (Outstanding: PKR {inv.outstandingAmount.toLocaleString()})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-500 text-center">
                    No hospital invoices generated for this record.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
