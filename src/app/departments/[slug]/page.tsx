'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import LockedPageGate from '@/components/LockedPageGate';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Stethoscope,
  Users,
  CalendarClock,
  CreditCard,
  Building,
  Activity,
  ArrowLeft,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Plus,
} from 'lucide-react';

export default function DepartmentDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'patients' | 'billing'>('appointments');

  useEffect(() => {
    fetchDepartmentData();
  }, [slug]);

  const fetchDepartmentData = async () => {
    try {
      const res = await fetch(`/api/departments/${slug}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error('Error fetching department data', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Department Console" subtitle="Loading clinical data..." />
        <div className="p-16 text-center text-slate-500">
          <Clock className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
          Loading department records from Neon PostgreSQL...
        </div>
      </div>
    );
  }

  const deptName = data?.department || 'Department Console';
  const doctor = data?.doctor;
  const stats = data?.stats || { totalPatients: 0, totalAppointments: 0, totalInvoices: 0, revenuePKR: 0, pendingPKR: 0 };

  return (
    <LockedPageGate pageTitle={`${deptName} Clinical Console`} requiredDepartment={deptName} departmentName={deptName}>
      <div className="flex flex-col min-h-screen">
      <Header
        title={`${deptName} Department`}
        subtitle={`Clinical Console & Physician Dashboard • ${doctor?.name || 'Assigned Specialist'}`}
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Navigation & Doctor Identity Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-emerald-700 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Departments
            </Link>

            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
              {doctor?.availability || 'On Duty'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">{doctor?.name}</span>
            <span>•</span>
            <span>{doctor?.experience} Experience</span>
            <span>•</span>
            <span className="font-mono text-emerald-700">{doctor?.contact}</span>
          </div>
        </div>

        {/* Doctor Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
              {doctor?.avatarUrl ? (
                <img src={doctor.avatarUrl} alt={doctor.name} className="w-full h-full object-cover" />
              ) : (
                <Stethoscope className="w-8 h-8 text-emerald-300" />
              )}
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                Lead Attending Physician
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{doctor?.name || deptName}</h1>
              <p className="text-xs text-emerald-100">{doctor?.specialty} • AuraCare Hospital Medical Staff</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/consultancy"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <CalendarClock className="w-4 h-4" />
              <span>Book Department Slot</span>
            </Link>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Assigned Patients</span>
              <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalPatients}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Total Bookings</span>
              <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalAppointments}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Settled Revenue</span>
              <h3 className="text-2xl font-extrabold text-emerald-700">PKR {stats.revenuePKR.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Pending Invoices</span>
              <h3 className="text-2xl font-extrabold text-amber-700">PKR {stats.pendingPKR.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'appointments'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarClock className="w-4 h-4" />
            <span>Consultancy Appointments ({data?.appointments?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'patients'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Admitted & Registered Patients ({data?.patients?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'billing'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Department Invoices ({data?.invoices?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Appointments */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3.5 px-6">Booking Code</th>
                    <th className="py-3.5 px-6">Patient Name</th>
                    <th className="py-3.5 px-6">Time Slot & Date</th>
                    <th className="py-3.5 px-6">Consultation Mode</th>
                    <th className="py-3.5 px-6">Verification OTP</th>
                    <th className="py-3.5 px-6">Payment</th>
                    <th className="py-3.5 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.appointments?.length > 0 ? (
                    data.appointments.map((app: any) => (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{app.bookingCode}</td>
                        <td className="py-3.5 px-6">
                          <div className="font-semibold text-slate-900">{app.patientName}</div>
                          <div className="text-[11px] text-slate-400">{app.mobileNumber}</div>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="font-medium text-slate-800">{app.timeSlot}</div>
                          <div className="text-[10px] text-slate-400">{app.appointmentDate}</div>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            {app.consultationType}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-mono font-bold text-emerald-700 bg-emerald-50/50">
                          {app.otpCode}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-slate-800">
                          ${app.consultationFee?.toFixed(2)} ({app.paymentStatus})
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No appointments currently scheduled for {deptName}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Patients */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3.5 px-6">Patient Name</th>
                    <th className="py-3.5 px-6">Age / Gender</th>
                    <th className="py-3.5 px-6">Condition</th>
                    <th className="py-3.5 px-6">Room / Unit</th>
                    <th className="py-3.5 px-6">Admitted Status</th>
                    <th className="py-3.5 px-6 text-right">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.patients?.length > 0 ? (
                    data.patients.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-6 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3.5 px-6">{p.age} yrs • {p.gender}</td>
                        <td className="py-3.5 px-6 font-semibold text-slate-800">{p.condition}</td>
                        <td className="py-3.5 px-6 text-slate-600">{p.roomNumber || 'Outpatient Clinic'}</td>
                        <td className="py-3.5 px-6">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono text-slate-700">{p.contact}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No patients assigned to {deptName}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Billing */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3.5 px-6">Invoice #</th>
                    <th className="py-3.5 px-6">Patient</th>
                    <th className="py-3.5 px-6">Total Bill</th>
                    <th className="py-3.5 px-6">Paid</th>
                    <th className="py-3.5 px-6">Outstanding</th>
                    <th className="py-3.5 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.invoices?.length > 0 ? (
                    data.invoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-3.5 px-6 font-semibold text-slate-800">{inv.patientName}</td>
                        <td className="py-3.5 px-6 font-bold text-slate-900">PKR {inv.totalAmount.toLocaleString()}</td>
                        <td className="py-3.5 px-6 font-bold text-emerald-700">PKR {inv.paidAmount.toLocaleString()}</td>
                        <td className="py-3.5 px-6 font-bold text-amber-700">PKR {inv.outstandingAmount.toLocaleString()}</td>
                        <td className="py-3.5 px-6 text-right">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No invoices registered under {deptName}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
    </LockedPageGate>
  );
}
