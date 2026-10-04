'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import MetricCard from '@/components/MetricCard';
import {
  Users,
  UserCheck,
  AlertTriangle,
  Package,
  Plus,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface DashboardData {
  metrics: {
    totalPatients: number;
    totalDoctors: number;
    onDutyDoctors: number;
    lowStockItems: number;
    totalInventory: number;
  };
  recentPatients: Array<{
    id: number;
    name: string;
    age: number;
    gender: string;
    condition: string;
    status: string;
    assignedDoctor?: string;
    doctor?: { name: string; specialty: string };
  }>;
  doctors: Array<{
    id: number;
    name: string;
    specialty: string;
    availability: string;
    experience: string;
    avatarUrl: string;
  }>;
  lowStockAlerts: Array<{
    id: number;
    name: string;
    category: string;
    stock: number;
    minThreshold: number;
    unitPrice: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restockingId, setRestockingId] = useState<number | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickRestock = async (itemId: number) => {
    setRestockingId(itemId);
    try {
      const res = await fetch(`/api/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta: 15 }),
      });
      if (res.ok) {
        await fetchDashboard();
      }
    } catch (err) {
      console.error('Failed to restock item', err);
    } finally {
      setRestockingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Admitted':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Outpatient':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Recovering':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Under Observation':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex-1 bg-transparent min-h-screen flex flex-col">
      <Header
        title="Clinic Dashboard"
        subtitle="Real-time clinical operations, patient intake & pharmacy inventory"
      />

      <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white p-8 shadow-xl shadow-emerald-900/10"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-semibold backdrop-blur-sm border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>Small Clinic Operations Center</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Welcome to AuraCare HMS
              </h2>
              <p className="text-emerald-100/90 text-sm max-w-xl leading-relaxed">
                All systems operating normally. View active patient flow, check on-duty physician
                roster, and manage pharmacy dispensary levels below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setRefreshing(true);
                  fetchDashboard();
                }}
                disabled={refreshing}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-2 backdrop-blur-sm border border-white/20 transition-all shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Sync Data'}</span>
              </motion.button>

              <Link href="/patients">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs flex items-center gap-2 shadow-lg shadow-black/10 transition-all"
                >
                  <Plus className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  <span>New Patient Intake</span>
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Decorative curved shapes */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-xl" />
          <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-teal-400/10 pointer-events-none blur-lg" />
        </motion.div>

        {/* 4 Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Patients"
            value={loading ? '...' : (data?.metrics.totalPatients ?? 0)}
            subtitle="Active medical records in clinic"
            icon={Users}
            badgeText="+100% Mock Seeding"
            badgeType="emerald"
            delayIndex={0}
          />
          <MetricCard
            title="Doctors On Duty"
            value={loading ? '...' : `${data?.metrics.onDutyDoctors ?? 0} / ${data?.metrics.totalDoctors ?? 0}`}
            subtitle="Physicians currently available"
            icon={UserCheck}
            badgeText={data?.metrics.onDutyDoctors ? 'Active Shift' : 'Off Shift'}
            badgeType="info"
            delayIndex={1}
          />
          <MetricCard
            title="Low Stock Items"
            value={loading ? '...' : (data?.metrics.lowStockItems ?? 0)}
            subtitle="Items below min threshold"
            icon={AlertTriangle}
            badgeText={
              (data?.metrics.lowStockItems ?? 0) > 0 ? 'Restock Needed' : 'Inventory Healthy'
            }
            badgeType={(data?.metrics.lowStockItems ?? 0) > 0 ? 'warning' : 'emerald'}
            delayIndex={2}
          />
          <MetricCard
            title="Total Inventory Items"
            value={loading ? '...' : (data?.metrics.totalInventory ?? 0)}
            subtitle="Cataloged pharmaceuticals & tools"
            icon={Package}
            badgeText="Dispensary Active"
            badgeType="emerald"
            delayIndex={3}
          />
        </div>

        {/* Two-column dashboard layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recent Patients (2 cols wide) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Recent Patients & Triage
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest registered patients and diagnostic conditions
                </p>
              </div>

              <Link
                href="/patients"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
              >
                View Full Patient Directory
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100 flex-1">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Loading patient records...
                </div>
              ) : data?.recentPatients && data.recentPatients.length > 0 ? (
                data.recentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{patient.name}</h4>
                          <span className="text-xs text-slate-400">
                            • {patient.age} yrs ({patient.gender.charAt(0)})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          {patient.condition}
                        </p>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                          <Stethoscope className="w-3 h-3 text-emerald-600" />
                          <span>
                            Dr. {patient.doctor?.name || patient.assignedDoctor || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1.5">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${getStatusBadge(
                          patient.status
                        )}`}
                      >
                        {patient.status}
                      </span>
                      <Link
                        href="/patients"
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium hover:underline flex items-center gap-0.5"
                      >
                        Edit Details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No patients found.
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column: Doctors on Duty & Pharmacy Alerts */}
          <div className="space-y-6">
            {/* On Duty Doctors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Doctor Registry
                  </h3>
                  <p className="text-[11px] text-slate-500">Staff availability status</p>
                </div>
                <Link
                  href="/doctors"
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  All Staff
                </Link>
              </div>

              <div className="mt-3 space-y-3">
                {data?.doctors?.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{doc.name}</p>
                        <p className="text-[11px] text-slate-500">{doc.specialty}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        doc.availability === 'On Duty'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.availability === 'On Call'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {doc.availability}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Inventory Alerts Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Low-Stock Supplies
                  </h3>
                  <p className="text-[11px] text-slate-500">Items below minimum stock</p>
                </div>
                <Link
                  href="/inventory"
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Manage Store
                </Link>
              </div>

              <div className="mt-3 space-y-3">
                {data?.lowStockAlerts && data.lowStockAlerts.length > 0 ? (
                  data.lowStockAlerts.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-bold text-rose-600">
                            {item.stock} in stock
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (Min: {item.minThreshold})
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickRestock(item.id)}
                        disabled={restockingId === item.id}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 shadow-xs flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{restockingId === item.id ? '...' : '+15'}</span>
                      </motion.button>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-1.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <span>All clinic inventory levels are optimal</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
