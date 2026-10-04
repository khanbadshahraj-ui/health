'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'emerald';
  delayIndex?: number;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = 'emerald',
  delayIndex = 0,
}: MetricCardProps) {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'success':
      case 'emerald':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delayIndex * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
      {/* Decorative subtle emerald gradient glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {value}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
            {subtitle}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
          <Icon className="w-6 h-6 stroke-[2]" />
        </div>
      </div>

      {badgeText && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${getBadgeStyle()}`}>
            {badgeText}
          </span>
          <span className="text-[11px] text-slate-400">Live DB Metric</span>
        </div>
      )}
    </motion.div>
  );
}
