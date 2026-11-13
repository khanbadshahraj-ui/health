'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  User,
  Activity,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Building,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(username, password);
    setLoading(false);

    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl);
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/25">
            <Activity className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            AuraCare Memorial Clinic
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Staff & Physician Secure Department Authentication
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Username or ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or dr.elena"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Preset Bar */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Quick 1-Click Role Fill (Demo)
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'AdminPassword2026!')}
              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-left border border-emerald-200/60 font-semibold transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div className="truncate">
                <span className="block leading-none">Super Admin</span>
                <span className="text-[10px] text-emerald-600 font-normal">Full Access</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('dr.elena', 'DoctorElena2026!')}
              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-left border border-blue-200/60 font-semibold transition flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <div className="truncate">
                <span className="block leading-none">Dr. Elena</span>
                <span className="text-[10px] text-blue-600 font-normal">Cardiology</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('dr.marcus', 'DoctorMarcus2026!')}
              className="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-left border border-teal-200/60 font-semibold transition flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <div className="truncate">
                <span className="block leading-none">Dr. Marcus</span>
                <span className="text-[10px] text-teal-600 font-normal">Pediatrics</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('reception', 'Reception2026!')}
              className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-left border border-amber-200/60 font-semibold transition flex items-center gap-1.5"
            >
              <Building className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <div className="truncate">
                <span className="block leading-none">Reception Desk</span>
                <span className="text-[10px] text-amber-600 font-normal">Intake Staff</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
