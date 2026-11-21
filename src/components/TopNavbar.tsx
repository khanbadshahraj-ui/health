'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CalendarClock,
  FileText,
  LayoutDashboard,
  Menu,
  LogIn,
  LogOut,
  Activity,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GoldenAnalogClock from '@/components/GoldenAnalogClock';

interface TopNavbarProps {
  onOpenMobileMenu?: () => void;
}

export default function TopNavbar({ onOpenMobileMenu }: TopNavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/' || pathname === '/home',
    },
    {
      name: 'Book Slot',
      href: '/consultancy',
      icon: CalendarClock,
      isActive: pathname === '/consultancy',
    },
    {
      name: 'My Record',
      href: '/patient-portal',
      icon: FileText,
      isActive: pathname === '/patient-portal',
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard',
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 md:left-72 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm transition-all">
      {/* 1. Main Row: Always visible across both Desktop and Mobile */}
      <div className="px-3 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-3">
        {/* Left: Mobile Brand / Desktop Navigation Pills */}
        <div className="flex items-center gap-3">
          {/* Mobile-only Brand logo */}
          <Link href="/" className="md:hidden flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-black text-xs text-slate-900 leading-tight">AuraCare</span>
              <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider px-1 py-0.2 bg-emerald-100 rounded">
                Clinic
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Pills: Home, Book Slot, My Record, Dashboard, Consoles */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    link.isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-white/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {onOpenMobileMenu && (
              <button
                onClick={onOpenMobileMenu}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-slate-700 hover:text-slate-900 hover:bg-white/80 transition"
                title="All Consoles & Departments"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>All Consoles</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Section: Golden Analog Always Floating Card Clock & Staff Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Golden Analog Always Floating Card Clock with Dynamic 3D Glowing Shadow */}
          <div className="flex items-center">
            {/* Desktop / Tablet: Full Floating Card Clock */}
            <div className="hidden sm:block">
              <GoldenAnalogClock />
            </div>
            {/* Mobile: Compact Dial with Golden 3D Glow */}
            <div className="sm:hidden">
              <GoldenAnalogClock compact />
            </div>
          </div>

          {/* Staff Login / User Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 pr-2 sm:pr-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100/70 transition shadow-xs text-left"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase leading-tight">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Signed in as</span>
                    <div className="font-mono text-xs font-bold text-slate-900 truncate">{user.name}</div>
                    <div className="text-[10px] text-emerald-700 font-medium">{user.role} • {user.department}</div>
                  </div>

                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Admin Credentials</span>
                    </Link>
                  )}

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                    <span>Executive Dashboard</span>
                  </Link>

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
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <LogIn className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Staff Login</span>
              <span className="sm:hidden">Login</span>
            </Link>
          )}

          {/* Mobile Drawer Toggle Button */}
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-1.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              aria-label="Toggle Full Menu Drawer"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Mobile-Only Navigation Bar Row: Home, Book Slot, My Record, Dashboard, Menu (Always Visible with appropriate padding) */}
      <div className="md:hidden border-t border-slate-100/90 px-2 py-1.5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1 py-1 px-2.5 rounded-xl transition text-[11px] font-bold shrink-0 ${
                link.isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{link.name}</span>
            </Link>
          );
        })}

        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="flex items-center gap-1 py-1 px-2.5 rounded-xl transition text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 shrink-0"
            aria-label="Open Consoles Menu"
          >
            <Menu className="w-3.5 h-3.5 shrink-0" />
            <span>Menu</span>
          </button>
        )}
      </div>
    </header>
  );
}
