'use client';

import React, { useState, useEffect } from 'react';
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
  Menu,
  X,
  Lock,
  FileText,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const publicNavItems = [
    {
      name: 'Home',
      href: '/home',
      icon: Home,
      description: 'Clinic introduction & video tour',
      badge: 'Public',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      name: 'New Patient Booking',
      href: '/consultancy',
      icon: CalendarClock,
      description: 'Book doctor slot (No login needed)',
      badge: 'Free Access',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      name: 'Patient Medical Portal',
      href: '/patient-portal',
      icon: FileText,
      description: 'Lookup treatment & records via ID',
      badge: 'ID Lookup',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
  ];

  const lockedNavItems = [
    {
      name: 'Executive Dashboard',
      href: '/',
      icon: LayoutDashboard,
      description: 'Clinic overview & operational KPIs',
      badge: 'Staff Only',
    },
    {
      name: 'Admin Security Console',
      href: '/admin',
      icon: ShieldCheck,
      description: 'Master accounts & credentials file',
      badge: 'Admin Only',
    },
    {
      name: 'Billing & Invoices',
      href: '/billing',
      icon: CreditCard,
      description: 'PKR Invoices & Safepay Gateway',
      badge: 'Billing',
    },
    {
      name: 'Reception & Intake',
      href: '/reception',
      icon: Camera,
      description: 'Live camera intake & Google Sheet sync',
      badge: 'Reception',
    },
    {
      name: 'Patient Admissions',
      href: '/patients',
      icon: Users,
      description: 'Clinical inpatient & outpatient registry',
      badge: 'Clinical',
    },
    {
      name: 'Doctor Registry',
      href: '/doctors',
      icon: Stethoscope,
      description: 'Medical staff & roster status',
      badge: 'Medical',
    },
    {
      name: 'Inventory & Store',
      href: '/inventory',
      icon: Package,
      description: 'Pharmacy drugs & supply stocks',
      badge: 'Pharmacy',
    },
  ];

  const departmentShortcuts = [
    { name: 'Cardiology', href: '/departments/cardiology', doctor: 'Dr. Elena Rostova' },
    { name: 'Pediatrics', href: '/departments/pediatrics', doctor: 'Dr. Marcus Vance' },
    { name: 'General Practice', href: '/departments/general-practice', doctor: 'Dr. Sarah Jenkins' },
    { name: 'Orthopedics', href: '/departments/orthopedics', doctor: 'Dr. David Kim' },
    { name: 'Dermatology', href: '/departments/dermatology', doctor: 'Dr. Anita Desai' },
  ];

  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
              AuraCare <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">Clinic</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Hospital Management</p>
          </div>
        </Link>
        {mobileMenuOpen && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Body */}
      <div className="px-3 py-3 flex-1 overflow-y-auto space-y-4">
        {/* Public Services Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Public Patient Services</span>
            </p>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Open to All
            </span>
          </div>

          {publicNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/80'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-700/60 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="block leading-none text-xs font-bold">{item.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                        isActive ? 'bg-white text-emerald-800' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-200 shrink-0" />}
              </Link>
            );
          })}
        </div>

        {/* Locked Staff Dashboards */}
        <div className="space-y-1 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Staff Dashboards</span>
            </p>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Login Required
            </span>
          </div>

          {lockedNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="block leading-none text-xs font-medium">{item.name}</span>
                    <div className="flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                      <span className="text-[9px] px-1 py-0.2 rounded font-semibold text-slate-500 bg-slate-100">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              </Link>
            );
          })}
        </div>

        {/* Doctor Department Consoles */}
        <div className="space-y-1 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" />
              <span>Doctor Consoles</span>
            </p>
            <Lock className="w-3 h-3 text-slate-400" />
          </div>

          <div className="space-y-0.5">
            {departmentShortcuts.map((dept) => {
              const isDeptActive = pathname === dept.href;
              return (
                <Link
                  key={dept.href}
                  href={dept.href}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isDeptActive
                      ? 'bg-emerald-100/90 text-emerald-900 font-bold'
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
                <div className="text-[10px] text-emerald-700 font-semibold truncate uppercase">
                  {user.role} • {user.department}
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
          <div className="space-y-1.5">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Staff & Doctor Login</span>
            </Link>
            <p className="text-[10px] text-center text-slate-400">
              Patients do not need staff credentials
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar (visible only on md screens and up) */}
      <aside className="hidden md:flex w-72 bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex-col h-screen sticky top-0 shadow-sm z-30 shrink-0">
        {renderNavContent()}
      </aside>

      {/* 2. Mobile Top Bar (Android & iOS) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-lg border-b border-slate-200/80 px-4 flex items-center justify-between z-40 shadow-xs">
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 leading-tight">AuraCare Clinic</h1>
            <p className="text-[10px] text-slate-400 leading-none">Medical Center</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-800">
              <span>{user.name.split(' ')[0]}</span>
              <button onClick={() => logout()} title="Logout" className="text-slate-400 hover:text-rose-600">
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
            >
              <LogIn className="w-3 h-3" />
              <span>Login</span>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. Mobile Slide-out Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {renderNavContent()}
          </div>
        </div>
      )}

      {/* 4. Mobile Bottom Navigation Bar (iOS & Android thumb navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around z-30 shadow-lg">
        <Link
          href="/home"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            pathname === '/home' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        <Link
          href="/consultancy"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            pathname === '/consultancy' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarClock className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Book Slot</span>
        </Link>

        <Link
          href="/patient-portal"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            pathname === '/patient-portal' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">My Record</span>
        </Link>

        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            pathname === '/' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <span className="text-[10px] mt-0.5">Staff Portal</span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-900"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </div>
    </>
  );
}
