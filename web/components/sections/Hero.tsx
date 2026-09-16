"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { MOODS } from "@/lib/constants";
import { ArrowRightIcon, SparklesIcon, HeartIcon } from "@/components/ui/Icons";

export const Hero: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>("great");

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Decorative subtle ambient circles */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary-light/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            {/* Pill Indicator */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-moody-border text-xs font-semibold text-primary shadow-xs">
              <SparklesIcon size={14} className="text-primary" />
              <span>Next-Gen Emotional Wellness Companion</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-moody-text leading-[1.12]">
              Your daily <br />
              <span className="text-primary">emotional intelligence</span>
              <br />
              partner.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-moody-muted max-w-xl leading-relaxed">
              Moody AI brings warmth, clarity, and science to mental wellness.
              Log your feelings in seconds, speak your mind with speech-to-text voice journaling,
              talk naturally to real-time AI voice companions, and uncover patterns that shape your days.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                href="#demo"
                size="lg"
                variant="primary"
                icon={<ArrowRightIcon size={18} />}
              >
                Try Live Mood Check-in
              </Button>
              <Button href="#features" size="lg" variant="secondary">
                See How It Works
              </Button>
            </div>

            {/* Trust / Badge items */}
            <div className="pt-6 border-t border-moody-border/80 w-full flex flex-wrap items-center gap-6 text-xs text-moody-muted">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>100% Private & Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-orange-100 text-primary flex items-center justify-center font-bold text-[10px]">
                  <HeartIcon size={12} />
                </div>
                <span>Designed for Daily Calm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                  ⚡
                </div>
                <span>Real-Time Voice & Chat</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic Interactive Mobile Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <PhoneFrame badge="Interactive Mobile App Preview">
              {/* App Screen Inside Frame */}
              <div className="flex flex-col space-y-4 pb-2">
                {/* Header Banner Block */}
                <div className="bg-primary-light/35 -mx-4 -mt-2 px-4 pt-3 pb-5 rounded-b-3xl border-b border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center font-bold text-xs text-primary">
                        JD
                      </div>
                      <div>
                        <p className="text-[10px] text-moody-muted">Hi 👋</p>
                        <p className="text-xs font-bold text-moody-text">Jessica</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center text-xs">
                      🔔
                    </div>
                  </div>

                  <p className="text-[10px] text-moody-muted">Good afternoon,</p>
                  <h3 className="text-lg font-bold text-moody-text leading-snug">
                    Welcome back,<br />how&apos;s your mind today?
                  </h3>
                </div>

                {/* Mood Selector Simulation */}
                <div className="bg-white p-3 rounded-2xl shadow-xs border border-moody-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-moody-text">
                      Daily Check-in
                    </span>
                    <span className="text-[10px] text-primary font-medium">
                      Tap a mood
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1 text-center">
                    {MOODS.map((m) => {
                      const isSelected = selectedMood === m.key;
                      return (
                        <button
                          key={m.key}
                          onClick={() => setSelectedMood(m.key)}
                          className={`flex flex-col items-center p-1.5 rounded-xl transition-all ${
                            isSelected
                              ? "bg-primary-light/40 ring-2 ring-primary scale-105"
                              : "hover:bg-neutral-50"
                          }`}
                        >
                          <div className="relative w-8 h-8 mb-1">
                            <Image
                              src={m.image}
                              alt={m.label}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-[9px] font-medium text-moody-muted">
                            {m.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Activities Preview Cards */}
                <div>
                  <p className="text-[11px] font-semibold text-moody-text mb-2">
                    Recommended Activities
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative h-20 rounded-xl overflow-hidden shadow-xs group">
                      <Image
                        src="/images/yoga.jpg"
                        alt="Relaxing Audios"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-2 text-white">
                        <span className="text-[10px] font-bold leading-tight">
                          Relaxing Audios
                        </span>
                        <span className="text-[8px] text-white/80">3-min Calm</span>
                      </div>
                    </div>

                    <div className="relative h-20 rounded-xl overflow-hidden shadow-xs group">
                      <Image
                        src="/images/workout.jpg"
                        alt="Dance Workout"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-2 text-white">
                        <span className="text-[10px] font-bold leading-tight">
                          Dance Workout
                        </span>
                        <span className="text-[8px] text-white/80">Energy Boost</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Inspiration Preview */}
                <div className="bg-white p-3 rounded-2xl border border-moody-border shadow-xs">
                  <span className="text-[9px] font-bold tracking-wider text-primary uppercase">
                    Daily Inspiration 🌅
                  </span>
                  <p className="text-[11px] text-moody-text italic mt-1 leading-snug">
                    &ldquo;You don&apos;t have to control your thoughts. You just have to stop letting them control you.&rdquo;
                  </p>
                  <p className="text-[9px] text-moody-muted text-right mt-1">
                    — Dan Millman
                  </p>
                </div>
              </div>
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
};
