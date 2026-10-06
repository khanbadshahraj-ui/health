'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Package,
  Activity,
  PlusCircle,
  PhoneCall,
  ShieldCheck,
  ChevronRight,
  Camera,
  CalendarClock,
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  {
    name: 'Home',
    href: '/home',
    icon: Activity,
    description: 'Welcome & promotional video',
  },
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Clinic overview & stats',
  },
  {
    name: 'Consultancy & Slots',
    href: '/consultancy',
    icon: CalendarClock,
    description: 'Vacant slots & advance booking',
  },
  {
    name: 'Reception & Intake',
    href: '/reception',
    icon: Camera,
    description: 'Camera photo & Google Sheet',
  },
  {
    name: 'Patients',
    href: '/patients',
    icon: Users,
    description: 'Records & admissions',
  },
  {
    name: 'Doctor Registry',
    href: '/doctors',
    icon: Stethoscope,
    description: 'Staff & availability',
  },
  {
    name: 'Inventory & Store',
    href: '/inventory',
    icon: Package,
    description: 'Supplies & pharmaceuticals',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col h-screen sticky top-0 shadow-sm z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              AuraCare <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase tracking-wider">Clinic</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Hospital Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 py-6 flex-1 overflow-y-auto space-y-1.5">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Clinic Operations
        </p>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative group flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-semibold'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-700/50 text-white'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block leading-none">{item.name}</span>
                <span
                  className={`text-[11px] block mt-1 truncate ${
                    isActive ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {item.description}
                </span>
              </div>
              {isActive && (
                <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0" />
              )}
            </Link>
          );
        })}

        {/* Quick Emergency / Hotline Box */}
        <div className="mt-8 mx-1 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs mb-1.5">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>Emergency Triage</span>
          </div>
          <p className="text-xs text-slate-600 mb-2">
            Priority ambulance line available 24/7.
          </p>
          <div className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200/60 inline-flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            +1 (800) 911-AURA
          </div>
        </div>
      </div>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-600">SQLite Local Sync</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-semibold">
            v1.0 MVP
          </span>
        </div>
      </div>
    </aside>
  );
}
