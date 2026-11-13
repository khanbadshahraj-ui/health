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
  CreditCard,
  Building,
  KeyRound,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      name: 'Home',
      href: '/home',
      icon: Activity,
      description: 'Welcome & promotional video',
    },
    {
      name: 'Main Clinic Dashboard',
      href: '/',
      icon: LayoutDashboard,
      description: 'Clinic overview & stats',
    },
    {
      name: 'Admin & Credentials',
      href: '/admin',
      icon: ShieldCheck,
      description: 'Master accounts & passwords file',
      badge: 'Admin',
    },
    {
      name: 'Billing & Invoices',
      href: '/billing',
      icon: CreditCard,
      description: 'PKR Invoices & Pay Online Sandbox',
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

  const departmentShortcuts = [
    { name: 'Cardiology', href: '/departments/cardiology', doctor: 'Dr. Elena' },
    { name: 'Pediatrics', href: '/departments/pediatrics', doctor: 'Dr. Marcus' },
    { name: 'General Practice', href: '/departments/general-practice', doctor: 'Dr. Sarah' },
    { name: 'Orthopedics', href: '/departments/orthopedics', doctor: 'Dr. David' },
    { name: 'Dermatology', href: '/departments/dermatology', doctor: 'Dr. Anita' },
  ];

  return (
    <aside className="w-72 bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col h-screen sticky top-0 shadow-sm z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              AuraCare <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase tracking-wider">Clinic</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Hospital Management</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="px-4 py-4 flex-1 overflow-y-auto space-y-4">
        {/* Core Nav */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Operations & Portals
          </p>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
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
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="block leading-none text-xs font-bold">{item.name}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                        isActive ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Department Dashboards */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between px-3 mb-1.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Department Consoles
            </p>
            <Building className="w-3 h-3 text-slate-400" />
          </div>

          <div className="space-y-0.5">
            {departmentShortcuts.map((dept) => {
              const isDeptActive = pathname === dept.href;
              return (
                <Link
                  key={dept.href}
                  href={dept.href}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isDeptActive
                      ? 'bg-emerald-100/80 text-emerald-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{dept.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{dept.doctor}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* User / Auth Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium truncate">
                  {user.role} ({user.department})
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Staff & Doctor Login</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
