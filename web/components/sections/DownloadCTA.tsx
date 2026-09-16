"use client";

import React from "react";
import Image from "next/image";
import { AppleIcon, GooglePlayIcon, ShieldCheckIcon } from "@/components/ui/Icons";

export const DownloadCTA: React.FC = () => {
  return (
    <section id="download" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#1A1A1A] text-white rounded-3xl lg:rounded-[44px] p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
          {/* Subtle warm ambient backdrop glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-primary-light">
                <span>Available on iOS & Android</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Start your journey toward emotional peace today.
              </h2>

              <p className="text-base text-neutral-300 max-w-xl leading-relaxed">
                Download Moody AI on your mobile device. Check in with your emotions,
                converse with your companion, and create a calm space dedicated entirely to your mental well-being.
              </p>

              {/* App Store Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#download"
                  className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-2xl hover:bg-neutral-100 transition-all font-semibold text-sm shadow-md"
                >
                  <AppleIcon size={24} className="text-black" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold leading-none">
                      Download on the
                    </p>
                    <p className="text-sm font-extrabold leading-tight">App Store</p>
                  </div>
                </a>

                <a
                  href="#download"
                  className="flex items-center gap-3 bg-white/10 text-white border border-white/20 px-6 py-3 rounded-2xl hover:bg-white/15 transition-all font-semibold text-sm shadow-md"
                >
                  <GooglePlayIcon size={24} className="text-primary-light" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold leading-none">
                      Get it on
                    </p>
                    <p className="text-sm font-extrabold leading-tight">Google Play</p>
                  </div>
                </a>
              </div>

              {/* Privacy Reassurance */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon size={16} className="text-emerald-400" />
                  <span>End-to-End Encrypted & Private</span>
                </div>
                <div>• Free check-ins & analytics included</div>
                <div>• Zero commercial ads</div>
              </div>
            </div>

            {/* Right Card with App Icon Badge */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-md">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg mb-4 ring-2 ring-primary">
                  <Image
                    src="/images/app.png"
                    alt="Moody AI App Icon"
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="text-lg font-bold text-white">Moody AI 🌿</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Cross-platform React Native & Expo SDK 54
                </p>
                <div className="mt-3 px-3 py-1 rounded-full bg-primary/20 text-primary-light text-[11px] font-semibold">
                  v1.0 Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
