'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GoldenAnalogClockProps {
  compact?: boolean;
}

export default function GoldenAnalogClock({ compact = false }: GoldenAnalogClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div
        className={`rounded-2xl bg-slate-950/90 border border-amber-400/60 flex items-center justify-center ${
          compact ? 'w-9 h-9' : 'px-3.5 py-1.5'
        }`}
      >
        <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const secondDeg = seconds * 6;
  const minuteDeg = (minutes + seconds / 60) * 6;
  const hourDeg = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;

  const dateString = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const timeString = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Dial dimension
  const size = compact ? 36 : 48;
  const center = size / 2;
  const radius = center - 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{
        opacity: 1,
        y: [0, -3, 0],
        boxShadow: [
          '0 8px 24px -3px rgba(217, 119, 6, 0.45), 0 0 18px 2px rgba(251, 191, 36, 0.4), inset 0 1px 2px rgba(254, 240, 138, 0.5)',
          '0 12px 30px -3px rgba(217, 119, 6, 0.6), 0 0 26px 4px rgba(251, 191, 36, 0.55), inset 0 1px 2px rgba(254, 240, 138, 0.6)',
          '0 8px 24px -3px rgba(217, 119, 6, 0.45), 0 0 18px 2px rgba(251, 191, 36, 0.4), inset 0 1px 2px rgba(254, 240, 138, 0.5)',
        ],
      }}
      transition={{
        y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
        boxShadow: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
        opacity: { duration: 0.3 },
      }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={`relative group select-none flex items-center gap-2.5 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/95 border border-amber-400/70 backdrop-blur-xl ${
        compact ? 'p-1' : 'px-3.5 py-1.5'
      }`}
    >
      {/* Dynamic 3D Golden Halo Glow */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-30 group-hover:opacity-70 blur-xs transition duration-500 pointer-events-none" />

      {/* Golden Analog Clock Face with Multi-Layer Bezel */}
      <div
        className="relative shrink-0 rounded-full flex items-center justify-center p-0.5 bg-gradient-to-tr from-amber-600 via-yellow-200 to-amber-500 shadow-md"
        style={{ width: size, height: size }}
      >
        {/* Inner dial with emerald-obsidian face */}
        <div
          className="relative w-full h-full rounded-full bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 overflow-hidden flex items-center justify-center border border-amber-300/50"
          style={{
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.85), inset 0 0 6px rgba(245, 158, 11, 0.35)',
          }}
        >
          {/* Radial gold sheen */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-300/20 via-transparent to-transparent pointer-events-none" />

          {/* SVG Dial with Roman/Tick Markers and Golden Hands */}
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10">
            {/* 12 Hour Notch Markers */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const isMajor = i % 3 === 0;
              const markerLength = isMajor ? (compact ? 3 : 4) : (compact ? 1.5 : 2.5);
              const r1 = radius - 1;
              const r2 = r1 - markerLength;
              const x1 = center + r1 * Math.sin(angle);
              const y1 = center - r1 * Math.cos(angle);
              const x2 = center + r2 * Math.sin(angle);
              const y2 = center - r2 * Math.cos(angle);

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMajor ? '#fef08a' : '#d97706'}
                  strokeWidth={isMajor ? (compact ? 1.2 : 1.8) : 0.8}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Hour Hand (Golden Blade) */}
            <line
              x1={center}
              y1={center}
              x2={center + (radius * 0.5) * Math.sin((hourDeg * Math.PI) / 180)}
              y2={center - (radius * 0.5) * Math.cos((hourDeg * Math.PI) / 180)}
              stroke="#fbbf24"
              strokeWidth={compact ? 1.8 : 2.4}
              strokeLinecap="round"
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.7))"
            />

            {/* Minute Hand (Golden Tapered Needle) */}
            <line
              x1={center}
              y1={center}
              x2={center + (radius * 0.72) * Math.sin((minuteDeg * Math.PI) / 180)}
              y2={center - (radius * 0.72) * Math.cos((minuteDeg * Math.PI) / 180)}
              stroke="#fef08a"
              strokeWidth={compact ? 1.2 : 1.6}
              strokeLinecap="round"
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.7))"
            />

            {/* Second Hand (Ticking Amber/Ruby Pointer) */}
            <line
              x1={center - (radius * 0.18) * Math.sin((secondDeg * Math.PI) / 180)}
              y1={center + (radius * 0.18) * Math.cos((secondDeg * Math.PI) / 180)}
              x2={center + (radius * 0.82) * Math.sin((secondDeg * Math.PI) / 180)}
              y2={center - (radius * 0.82) * Math.cos((secondDeg * Math.PI) / 180)}
              stroke="#f59e0b"
              strokeWidth={compact ? 0.9 : 1.1}
              strokeLinecap="round"
            />

            {/* Center Pivot Jewel */}
            <circle cx={center} cy={center} r={compact ? 1.8 : 2.4} fill="#fef08a" stroke="#b45309" strokeWidth="0.8" />
            <circle cx={center} cy={center} r={compact ? 0.8 : 1} fill="#ef4444" />
          </svg>
        </div>
      </div>

      {/* Date & Monospace Live Time (Expanded Card Mode) */}
      {!compact && (
        <div className="relative z-10 flex flex-col justify-center pr-1 min-w-[95px]">
          <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
            <span>{dateString}</span>
          </div>
          <div className="font-mono text-xs font-black text-amber-100 tracking-tight leading-tight mt-1 drop-shadow-sm">
            {timeString}
          </div>
        </div>
      )}
    </motion.div>
  );
}
