'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Star,
  Activity,
  ShieldCheck,
  Clock,
  HeartPulse,
  ArrowRight,
  Music,
  Users,
  Award,
  PhoneCall,
  CalendarClock,
  Lock,
  FileText,
  Building,
  LogIn,
  KeyRound,
  ShieldAlert,
  CreditCard,
  Package,
  Camera,
  Stethoscope,
  ChevronRight,
  Search,
} from 'lucide-react';

const testimonials = [
  {
    quote:
      "AuraCare revolutionized our family's healthcare experience. The triage speed, digital records, and compassionate care are world-class.",
    author: 'Emily Richardson',
    role: 'Patient since 2023',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    tag: 'General Consultation',
  },
  {
    quote:
      "As an attending physician, the integrated EHR and instant pharmacy dispensary link allow us to focus 100% on patient recovery and outcomes.",
    author: 'Dr. James Kenneth, MD',
    role: 'Chief Medical Officer',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
    tag: 'Cardiology & Triage',
  },
  {
    quote:
      "Automated stock warnings and real-time inventory adjustments eliminated delays in fulfilling critical prescriptions for our patients.",
    author: 'Laura Mitchell',
    role: 'Pharmacy Operations Lead',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    tag: 'Clinical Pharmacy',
  },
];

const highlights = [
  {
    icon: HeartPulse,
    title: 'Precision Diagnostics',
    description: 'Advanced clinical screening with real-time patient status tracking and instant triage analysis.',
  },
  {
    icon: Clock,
    title: 'Zero Waiting Bottlenecks',
    description: 'Streamlined intake pipelines get urgent cases to specialists in under 7 minutes.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Health Records',
    description: 'HIPAA-compliant, high-integrity medical registries synchronized with local hospital databases.',
  },
  {
    icon: Award,
    title: 'Certified Specialists',
    description: 'Multidisciplinary team covering Cardiology, Pediatrics, Orthopedics, and Emergency Care.',
  },
];

const lockedDashboards = [
  {
    title: 'Executive Clinic Dashboard',
    href: '/dashboard',
    icon: Activity,
    role: 'ADMIN & CLINICAL LEAD',
    description: 'Triage volume, patient throughput, active admissions, and pharmacy stock thresholds.',
    accent: 'border-emerald-200 hover:border-emerald-400',
  },
  {
    title: 'Cardiology Console',
    href: '/departments/cardiology',
    icon: HeartPulse,
    role: 'DR. ELENA ROSTOVA',
    description: 'Cardiac patient ECGs, hypertension regimens, consultation notes, and department billing.',
    accent: 'border-rose-200 hover:border-rose-400',
  },
  {
    title: 'Pediatrics Console',
    href: '/departments/pediatrics',
    icon: Stethoscope,
    role: 'DR. MARCUS VANCE',
    description: 'Child health tracking, growth charts, immunization schedules, and infant care admissions.',
    accent: 'border-teal-200 hover:border-teal-400',
  },
  {
    title: 'General Practice Console',
    href: '/departments/general-practice',
    icon: Users,
    role: 'DR. SARAH JENKINS',
    description: 'Outpatient consultations, routine screenings, preventative medicine, and lab referrals.',
    accent: 'border-blue-200 hover:border-blue-400',
  },
  {
    title: 'Reception & Intake Desk',
    href: '/reception',
    icon: Camera,
    role: 'RECEPTION STAFF',
    description: 'Live HD camera intake, patient registration, and PatientsRecord Google Sheet sync.',
    accent: 'border-amber-200 hover:border-amber-400',
  },
  {
    title: 'Hospital Billing & Invoices',
    href: '/billing',
    icon: CreditCard,
    role: 'BILLING DEPARTMENT',
    description: 'Automated invoice generation, PKR fee calculation, and online payment sandbox.',
    accent: 'border-purple-200 hover:border-purple-400',
  },
  {
    title: 'Pharmacy & Inventory',
    href: '/inventory',
    icon: Package,
    role: 'PHARMACY DISPENSARY',
    description: 'Pharmaceutical stock balances, automated reorder thresholds, and unit cost records.',
    accent: 'border-indigo-200 hover:border-indigo-400',
  },
  {
    title: 'Admin Security Center',
    href: '/admin',
    icon: ShieldCheck,
    role: 'SUPER ADMINISTRATOR',
    description: 'Master account directory, passwords file reader, and credential text file downloads.',
    accent: 'border-slate-300 hover:border-slate-500',
  },
];

export default function RootHomePage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.35;
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        audioRef.current?.pause();
      } else {
        videoRef.current.play();
        if (!isMuted && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const unmuteAndPlayAudio = () => {
    setIsMuted(false);
    if (videoRef.current) {
      videoRef.current.muted = true;
    }
    if (audioRef.current && isPlaying) {
      audioRef.current.muted = false;
      audioRef.current.play().catch(() => {});
    }
  };

  const muteAudio = () => {
    setIsMuted(true);
    if (videoRef.current) {
      videoRef.current.muted = true;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      unmuteAndPlayAudio();
    } else {
      muteAudio();
    }
  };

  return (
    <div className="flex-1 bg-transparent min-h-screen flex flex-col py-4 sm:py-8 px-3.5 sm:px-6 lg:px-8 space-y-10 sm:space-y-16 max-w-7xl mx-auto w-full pb-8 sm:pb-12">
      {/* Background audio track dedicated to only homepage video */}
      <audio ref={audioRef} src="/promo-music.mp3" preload="auto" loop />

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3 sm:space-y-4 pt-1 sm:pt-4"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-[11px] sm:text-xs font-bold tracking-wide uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Next-Generation Healthcare Portal</span>
        </div>

        <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Welcome to <span className="text-emerald-700">AuraCare Clinic</span>
        </h1>

        <p className="text-xs sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal px-2">
          Patient-first clinical management with instant online consultations, transparent treatment lookup, and frosted glass protected medical staff consoles.
        </p>

        {/* Primary Action Buttons: Designed specifically for Public Patients vs Hospital Staff */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2 max-w-2xl mx-auto w-full">
          {/* 1. New Patients (No Login Needed) */}
          <Link href="/consultancy" className="w-full sm:w-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-between sm:justify-center gap-3 shadow-md sm:shadow-lg shadow-emerald-600/25 transition cursor-pointer text-left"
            >
              <div className="p-1.5 sm:p-2 rounded-xl bg-white/20">
                <CalendarClock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1">
                <span className="block text-[10px] sm:text-[11px] font-extrabold uppercase text-emerald-100 tracking-wider">
                  New Patients (Free Access)
                </span>
                <span className="text-xs sm:text-sm font-black">Book Doctor Consultation</span>
              </div>
              <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
            </motion.div>
          </Link>

          {/* 2. Existing Patients (Lookup by ID) */}
          <Link href="/patient-portal" className="w-full sm:w-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-3.5 sm:p-4 rounded-2xl bg-white/95 hover:bg-white text-slate-800 font-bold text-sm flex items-center justify-between sm:justify-center gap-3 border border-slate-200/90 shadow-sm sm:shadow-md backdrop-blur-md transition cursor-pointer text-left"
            >
              <div className="p-1.5 sm:p-2 rounded-xl bg-blue-50 text-blue-700">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1">
                <span className="block text-[10px] sm:text-[11px] font-extrabold uppercase text-blue-700 tracking-wider">
                  Reported Patients
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900">Treatment & Invoices</span>
              </div>
              <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
            </motion.div>
          </Link>

          {/* 3. Hospital Staff Login */}
          <Link href="/login" className="w-full sm:w-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-between sm:justify-center gap-3 shadow-md transition cursor-pointer text-left"
            >
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-800 text-amber-400">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1">
                <span className="block text-[10px] sm:text-[11px] font-extrabold uppercase text-amber-400 tracking-wider">
                  Hospital Staff & Doctors
                </span>
                <span className="text-xs sm:text-sm font-black">Staff Login Portal</span>
              </div>
              <LogIn className="w-4 h-4 ml-1 shrink-0" />
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Promotional Video Showcase */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative max-w-4xl mx-auto w-full group"
      >
        <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition duration-500"></div>

        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-emerald-500/20 shadow-2xl">
          {/* Top Video Header Bar */}
          <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/60 z-20">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-200 tracking-wide truncate max-w-[200px] sm:max-w-none">
                AuraCare Official Clinic Tour & Overview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                <Music className="w-3 h-3" />
                {isMuted ? 'MUTED' : 'PLAYING'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 hidden sm:inline">
                CDN STREAM
              </span>
            </div>
          </div>

          {/* Video Player Container */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src="/promo.mp4"
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
              onPlay={() => {
                setIsPlaying(true);
                if (!isMuted && audioRef.current) {
                  audioRef.current.play().catch(() => {});
                }
              }}
              onPause={() => {
                setIsPlaying(false);
                audioRef.current?.pause();
              }}
            >
              <source src="/promo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Click to Unmute Pill Overlay */}
            {isMuted && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={unmuteAndPlayAudio}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-2xl backdrop-blur-md border border-white/30 z-30 transition-all cursor-pointer whitespace-nowrap"
              >
                <div className="p-1 sm:p-1.5 bg-white/20 rounded-full animate-bounce">
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <span>Play Sound Track</span>
              </motion.button>
            )}

            {/* Overlay Video Controls */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/10 opacity-90 transition-opacity z-20">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 sm:p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />}
                </button>
                <button
                  onClick={toggleMute}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold ${
                    isMuted
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Unmute Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Sound Active</span>
                    </>
                  )}
                </button>
                <span className="text-xs text-slate-300 font-medium hidden md:inline">
                  AuraCare Virtual Tour
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  HD Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hospital Access Architecture: Public vs. Locked Pages */}
      <div className="space-y-5 sm:space-y-6">
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Lock className="w-3 h-3 text-amber-600" />
            <span>Hospital Access & Security Model</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Public Services vs. Locked Medical Consoles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto px-2">
            Only the Homepage is open to general visitors. Clinical dashboards and departmental consoles are locked behind glassy blur security and require authorized staff credentials.
          </p>
        </div>

        {/* Public Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Card 1: New Patient Intake */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200 shadow-xs sm:shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white">
                Public Access • No Login Required
              </span>
              <CalendarClock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900">New Patient Consultancy & Slot Booking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                First-time visitors can browse real-time specialist schedules (Cardiology, Pediatrics, General Practice, etc.), select preferred slots, and complete advance booking without any password.
              </p>
            </div>

            <div className="pt-1 sm:pt-2">
              <Link
                href="/consultancy"
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition"
              >
                <span>Book Doctor Appointment</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Existing Patient Record Lookup */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-white border border-blue-200 shadow-xs sm:shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white">
                Patient Self-Service • ID Lookup
              </span>
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900">Reported Patient Treatment & Records Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patients who have visited AuraCare can view their medical history, attending physician, prescription instructions, and payment receipts using their issued Patient Hospital ID (e.g., <code className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-mono font-bold">PAT-0001</code>).
              </p>
            </div>

            <div className="pt-1 sm:pt-2">
              <Link
                href="/patient-portal"
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-700/20 transition"
              >
                <span>Access Treatment History</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Locked Staff Dashboards Grid */}
        <div className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Locked Hospital Consoles</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Opening any console below presents a frosted glassy blur security card until staff credentials are provided.
              </p>
            </div>
            <Link
              href="/login"
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {lockedDashboards.map((dash, idx) => {
              const Icon = dash.icon;
              return (
                <Link
                  key={idx}
                  href={dash.href}
                  className={`group p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white/85 backdrop-blur-md border ${dash.accent} shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden`}
                >
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[9px] sm:text-[10px] font-bold">
                        <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" />
                        <span>Locked</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 block tracking-tight uppercase">
                        {dash.role}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-700 transition">
                        {dash.title}
                      </h4>
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {dash.description}
                    </p>
                  </div>

                  <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 group-hover:text-emerald-700 font-semibold">
                    <span>Inspect Security Gate</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clinic Highlights / Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {highlights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * idx }}
              className="p-4 sm:p-6 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Patient & Staff Testimonials */}
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span>Patient & Physician Voices</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Trusted by Doctors. Loved by Patients.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto px-2">
            Real feedback from individuals and practitioners experiencing our seamless clinical environment.
          </p>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
        >
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {t.tag}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4 sm:mb-6 font-normal">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-emerald-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.author}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Squeezed Emergency Call to Action Banner (Improved for mobile view) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6"
      >
        <div className="space-y-1.5 sm:space-y-2 text-center md:text-left">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300">
            Rapid Response Available 24/7
          </span>
          <h3 className="text-xl sm:text-3xl font-black text-white">
            Need Immediate Emergency Triage?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Our trauma and priority ambulance team is standing by around the clock. Connect instantly with our on-duty emergency physicians.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-center">
          <a
            href="tel:+18009112872"
            className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-2xl bg-white text-emerald-800 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg hover:bg-emerald-50 transition active:scale-95"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600 animate-bounce" />
            <span>+1 (800) 911-AURA</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
