'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Calendar, Clock, UserCheck, Shield } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenNewPatient?: () => void;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [time, setTime] = useState<string>('');

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

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            className="p-2.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors border border-slate-200/70"
            title="Clinic Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </button>
        </div>

        {/* Doctor / Duty Staff Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center shadow-sm text-sm">
            Dr
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">Clinic Administrator</div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> On Duty Staff
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
