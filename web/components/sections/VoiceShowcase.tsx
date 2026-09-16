"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PhoneCallIcon, MicrophoneIcon, CheckIcon } from "@/components/ui/Icons";

export const VoiceShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"calling" | "journaling">("calling");

  return (
    <section id="voice" className="py-20 md:py-28 bg-[#F5ECE3]/50 border-y border-moody-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Explanatory Copy & Tab Switcher */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-primary/20 text-xs font-semibold text-primary">
              <MicrophoneIcon size={14} />
              <span>Voice-First Emotional Care</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-moody-text leading-tight">
              Sometimes it&apos;s easier to just speak.
            </h2>

            <p className="text-base text-moody-muted leading-relaxed">
              Typing out emotional turmoil when you&apos;re tired or stressed creates friction.
              With Moody, you can either hold a real-time hands-free voice call or record a candid voice memo that gets turned into a reflective diary entry.
            </p>

            {/* Mode Switcher */}
            <div className="flex p-1.5 bg-white rounded-2xl border border-moody-border max-w-sm">
              <button
                onClick={() => setActiveTab("calling")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "calling"
                    ? "bg-primary text-white shadow-xs"
                    : "text-moody-muted hover:text-moody-text"
                }`}
              >
                <PhoneCallIcon size={14} />
                <span>Live Voice Call</span>
              </button>
              <button
                onClick={() => setActiveTab("journaling")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "journaling"
                    ? "bg-primary text-white shadow-xs"
                    : "text-moody-muted hover:text-moody-text"
                }`}
              >
                <MicrophoneIcon size={14} />
                <span>Voice Journal</span>
              </button>
            </div>

            {/* Feature checklist */}
            <ul className="space-y-3 pt-2 text-sm text-moody-muted">
              {activeTab === "calling" ? (
                <>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                      <CheckIcon size={12} />
                    </span>
                    <span>Real-time voice streaming via Vapi & Daily WebRTC</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                      <CheckIcon size={12} />
                    </span>
                    <span>Calm, non-judgmental conversational tone with zero lag</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                      <CheckIcon size={12} />
                    </span>
                    <span>No scheduling needed—always available 24/7 on demand</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                      <CheckIcon size={12} />
                    </span>
                    <span>Accurate 16kHz PCM audio transcription by Gemini</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                      <CheckIcon size={12} />
                    </span>
                    <span>Automatic grammar polish without changing your voice or intent</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                      <CheckIcon size={12} />
                    </span>
                    <span>Smart title generation & emotional tone categorization</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Right Column: Visual Component Preview */}
          <div className="lg:col-span-6 flex justify-center">
            {activeTab === "calling" ? (
              /* Voice Call Interface Mockup */
              <div className="relative w-full max-w-md h-[460px] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <Image
                  src="/images/panda.jpg"
                  alt="Moody Voice Call"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col justify-between p-7 text-white">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary-light">
                      Live Call Session
                    </span>
                    <h4 className="text-xl font-bold mt-1">Moody AI Voice</h4>
                    <p className="text-xs text-white/70">Connected · 02:45</p>
                  </div>

                  {/* Pulsing visual circles */}
                  <div className="flex flex-col items-center justify-center my-auto">
                    <div className="relative w-28 h-28 rounded-full border-2 border-primary/60 flex items-center justify-center animate-pulse">
                      <div className="w-20 h-20 rounded-full bg-[#252525] border-2 border-primary flex items-center justify-center text-3xl shadow-lg">
                        🤖
                      </div>
                    </div>
                    <span className="text-xs text-white/80 mt-4 tracking-wide font-medium">
                      Moody is listening…
                    </span>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-lg">
                      🎙️
                    </div>
                    <div className="w-14 h-14 rounded-full bg-rose-600 flex items-center justify-center text-xl shadow-lg rotate-135">
                      📞
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Voice Journal Interface Mockup */
              <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-moody-border flex flex-col space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-moody-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
                    <span className="text-xs font-bold text-moody-text">Recording Processed</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Detected: Calm
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-moody-muted font-semibold">
                    Generated Title
                  </span>
                  <h4 className="text-lg font-bold text-moody-text mt-0.5">
                    Finding Clarity After a Long Morning
                  </h4>
                </div>

                <div className="bg-[#FDF6F0] p-4 rounded-2xl border border-moody-border/70 text-xs sm:text-sm text-moody-text leading-relaxed">
                  &ldquo;I woke up feeling pretty anxious about today&apos;s meetings, but after taking a short walk outside and breathing in the cold air, things started to feel manageable again. I realized I don&apos;t need to have every answer right now.&rdquo;
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-moody-muted">
                  <span>Duration: 00:42 · WAV 16kHz</span>
                  <span className="text-primary font-semibold">Saved to Journal</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
