"use client";

import React from "react";
import {
  MicrophoneIcon,
  MessageIcon,
  JournalIcon,
  ChartIcon,
  PhoneCallIcon,
  BellIcon,
} from "@/components/ui/Icons";

const FEATURES = [
  {
    icon: PhoneCallIcon,
    tag: "Vapi WebRTC",
    title: "Real-Time AI Voice Calling",
    description:
      "Talk to Moody aloud just like a trusted friend on the phone. Instant vocal responses with natural pacing, warm tone, and deep empathetic listening.",
    color: "bg-orange-50 text-primary border-orange-200",
  },
  {
    icon: JournalIcon,
    tag: "Gemini Voice Pipeline",
    title: "Voice Memo to Styled Journal",
    description:
      "Just speak your thoughts. Moody transcribes your audio, strips filler words ('um', 'uh'), gives it an insightful title, and infers your mood automatically.",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    icon: MessageIcon,
    tag: "Gemini 2.5 Flash",
    title: "Context-Aware Companion Chat",
    description:
      "Text with an AI that remembers your emotional journey. Designed strictly for mental wellness—never clinical, always gentle, encouraging, and non-judgmental.",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    icon: ChartIcon,
    tag: "Gifted Charts",
    title: "Weekly Mood Curves & Analytics",
    description:
      "Track your emotional evolution over 7-day trendlines and 30-day distributions. Uncover triggers, spot positive patterns, and celebrate streaks.",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    icon: BellIcon,
    tag: "Expo Notifications",
    title: "Smart Gentle Reminders",
    description:
      "Receive inspiring quotes at 9:00 AM to kickstart your day, and an evening check-in at 8:00 PM if you haven't yet taken time for yourself.",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    icon: MicrophoneIcon,
    tag: "Guided Sessions",
    title: "Audio Wellness Library",
    description:
      "Curated audio tracks divided into calming meditation soundscapes and serotonin-boosting dance workout tracks with full background audio support.",
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Core Capabilities
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-moody-text mt-2">
          Engineered for gentle, sustainable mental well-being.
        </h2>
        <p className="text-sm sm:text-base text-moody-muted mt-3">
          Every tool inside Moody AI is built to reduce emotional friction, celebrate small victories, and help you understand your emotional rhythm.
        </p>
      </div>

      {/* Grid of 6 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="bg-white rounded-3xl p-7 border border-moody-border hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${feature.color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={22} />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 uppercase">
                    {feature.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-moody-text group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-moody-muted mt-2.5 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-moody-border/60 flex items-center text-xs font-semibold text-primary gap-1">
                <span>Included in Moody Mobile</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
