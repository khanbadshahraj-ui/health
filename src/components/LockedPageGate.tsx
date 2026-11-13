'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  ShieldAlert,
  ArrowRight,
  LogIn,
  KeyRound,
  Home,
  UserCheck,
  Stethoscope,
  Building,
} from 'lucide-react';

interface LockedPageGateProps {
  pageTitle: string;
  departmentName?: string;
  requiredRole?: string;
  requiredDepartment?: string;
  children: React.ReactNode;
}

export default function LockedPageGate({
  pageTitle,
  departmentName,
  requiredRole,
  requiredDepartment,
  children,
}: LockedPageGateProps) {
  const { user, loading } = useAuth();

  // If loading auth state, show a clean glassy loader
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="p-8 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-xl text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700">Verifying Medical Staff Access Credentials...</p>
        </div>
      </div>
    );
  }

  // Determine access:
  // 1. ADMIN has universal access
  // 2. Otherwise user must be logged in
  // 3. If requiredRole or requiredDepartment is set, check matching
  let hasPermission = false;
  if (user) {
    if (user.role === 'ADMIN') {
      hasPermission = true;
    } else {
      const roleMatches = !requiredRole || user.role === requiredRole;
      const deptMatches = !requiredDepartment || user.department.toLowerCase() === requiredDepartment.toLowerCase();
      hasPermission = roleMatches && deptMatches;
    }
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  // Locked Gate UI with glassy blur background
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      {/* Blurred background preview of the restricted page content */}
      <div className="absolute inset-0 filter blur-xl opacity-30 pointer-events-none select-none overflow-hidden scale-105">
        {children}
      </div>

      {/* Glassmorphic Overlay Layer */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />

      {/* Prominent Floating Locked Gate Card */}
      <div className="relative z-10 max-w-lg w-full bg-white/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/60 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-500/25">
          <Lock className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Confidential Hospital Area
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {pageTitle} is Locked
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            {user ? (
              <>
                You are currently signed in as <span className="font-bold text-slate-900">{user.name}</span> ({user.department}). 
                This clinical dashboard is restricted to <span className="font-bold text-emerald-800">{departmentName || requiredDepartment || 'authorized staff'}</span> only.
              </>
            ) : (
              <>
                Public visitors can explore the Homepage, book new patient consultations, or look up their medical record.
                Access to internal hospital consoles requires verified staff credentials.
              </>
            )}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Staff / Doctor Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/home"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Public Home</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <span>Are you a registered patient?</span>
          <Link href="/patient-portal" className="font-bold text-emerald-700 hover:underline">
            Patient Medical Portal &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
