"use client";

import React, { useState } from "react";
import { MOCK_WEEKLY_STATS, MOCK_EMOTION_BREAKDOWN } from "@/lib/constants";
import { ChartIcon } from "@/components/ui/Icons";

export const AnalyticsPreview: React.FC = () => {
  const [activeDay, setActiveDay] = useState(MOCK_WEEKLY_STATS[4]); // Friday default

  return (
    <section id="analytics" className="py-20 md:py-28 bg-[#FDF6F0] border-t border-moody-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-primary/20 text-xs font-semibold text-primary mb-3">
            <ChartIcon size={14} />
            <span>Emotional Trends & Insights</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-moody-text">
            See the big picture of your emotional health.
          </h2>
          <p className="text-sm sm:text-base text-moody-muted mt-3">
            Moods fluctuate, but patterns tell stories. Moody turns your daily check-ins into actionable recovery insights, streak milestones, and distribution charts.
          </p>
        </div>

        {/* Analytics Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1: Weekly Trend Line & Score */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-moody-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-moody-text">
                    Weekly Emotional Trajectory
                  </h3>
                  <p className="text-xs text-moody-muted mt-0.5">
                    Past 7 days · Click on any point to inspect day details
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  +18% Uplift
                </span>
              </div>

              {/* Chart SVG Visualization */}
              <div className="relative pt-6 pb-2">
                <svg viewBox="0 0 500 160" className="w-full h-44 overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#F0EBE5" strokeDasharray="4 4" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#F0EBE5" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#F0EBE5" strokeDasharray="4 4" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="#F0EBE5" />

                  {/* Gradient Area Fill */}
                  <defs>
                    <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F07033" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#F07033" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area fill under curve */}
                  <path
                    d="M 35,80 Q 106,50 177,110 T 319,25 T 390,25 T 461,50 L 461,140 L 35,140 Z"
                    fill="url(#curveGradient)"
                  />

                  {/* The Curved Line */}
                  <path
                    d="M 35,80 Q 106,50 177,110 T 319,25 T 390,25 T 461,50"
                    fill="none"
                    stroke="#F07033"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Interactive Points */}
                  {MOCK_WEEKLY_STATS.map((stat, idx) => {
                    // Coordinate mapping
                    const x = 35 + idx * 71;
                    const y = 140 - (stat.score / 5) * 115;
                    const isActive = activeDay.day === stat.day;

                    return (
                      <g
                        key={stat.day}
                        onClick={() => setActiveDay(stat)}
                        className="cursor-pointer group"
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? "7" : "5"}
                          fill="#FFFFFF"
                          stroke="#F07033"
                          strokeWidth={isActive ? "3.5" : "2.5"}
                          className="transition-all group-hover:scale-125"
                        />
                        <text
                          x={x}
                          y="158"
                          textAnchor="middle"
                          fontSize="11"
                          fill={isActive ? "#1A1A1A" : "#9E9E9E"}
                          fontWeight={isActive ? "bold" : "normal"}
                        >
                          {stat.day}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Selected day badge banner */}
            <div className="mt-4 p-3 bg-moody-soft rounded-2xl border border-primary/20 flex items-center justify-between text-xs">
              <span className="font-semibold text-moody-text">
                {activeDay.day}: Level {activeDay.score}/5 ({activeDay.label})
              </span>
              <span className="text-primary font-medium">
                Log completed on mobile
              </span>
            </div>
          </div>

          {/* Card 2: 30-Day Emotion Breakdown & Insights */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* 30-day percentage distribution */}
            <div className="bg-white rounded-3xl p-6 border border-moody-border shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-moody-text">
                  30-Day Emotion Breakdown
                </h3>
                <span className="text-[10px] uppercase font-bold text-moody-muted">
                  30 Entries
                </span>
              </div>

              <div className="space-y-3">
                {MOCK_EMOTION_BREAKDOWN.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-moody-text flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.label}
                      </span>
                      <span className="text-moody-muted">{item.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak & Consistency Card */}
            <div className="bg-white rounded-3xl p-6 border border-moody-border shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-2xl flex items-center justify-center shrink-0">
                🔥
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Consistency Milestone
                </span>
                <h4 className="text-base font-bold text-moody-text">
                  7-Day Mindful Streak!
                </h4>
                <p className="text-xs text-moody-muted mt-0.5 leading-relaxed">
                  Logging consecutively builds self-awareness and emotional resilience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
