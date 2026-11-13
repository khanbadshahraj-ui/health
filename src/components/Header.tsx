'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Calendar, Clock, UserCheck, ShieldCheck, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenNewPatient?: () => void;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [time, setTime] = useState<string>('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200/80 px-8 py-4 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Date & Time pill */}
        <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200/70 px-3.5 py-1.5 rounded-xl text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{todayDate}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold font-mono">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{time || '--:--:--'}</span>
          </div>
        </div>

        {/* User Account / Login Pill */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100/70 transition shadow-xs text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold uppercase leading-tight">
                  {user.role} • {user.department}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 space-y-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Signed in as</span>
                  <div className="font-mono text-xs font-bold text-slate-900">{user.username}</div>
                  <div className="text-[11px] text-slate-500">{user.email}</div>
                </div>

                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Admin Credentials Console</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Staff / Doctor Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
