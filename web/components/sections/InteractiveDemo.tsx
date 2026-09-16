"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MOODS, MoodDefinition } from "@/lib/constants";
import { SparklesIcon, MessageIcon, HeartIcon } from "@/components/ui/Icons";

export const InteractiveDemo: React.FC = () => {
  const [activeMood, setActiveMood] = useState<MoodDefinition>(MOODS[3]); // Default "Happy"
  const [showChatSnippet, setShowChatSnippet] = useState<boolean>(false);

  return (
    <section id="demo" className="py-20 md:py-28 bg-white/70 border-y border-moody-border relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-moody-soft border border-primary/20 text-xs font-semibold text-primary mb-3">
            <SparklesIcon size={14} />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-moody-text">
            How are you feeling today?
          </h2>
          <p className="text-sm sm:text-base text-moody-muted mt-3 leading-relaxed">
            Select any emotion below to test how Moody AI acknowledges your headspace,
            provides empathetic reflection, and recommends grounding steps.
          </p>
        </div>

        {/* 5 Mood Selector Buttons */}
        <div className="grid grid-cols-5 gap-3 sm:gap-6 mb-10">
          {MOODS.map((mood) => {
            const isSelected = activeMood.key === mood.key;
            return (
              <button
                key={mood.key}
                onClick={() => {
                  setActiveMood(mood);
                  setShowChatSnippet(false);
                }}
                className={`flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[#FDF6F0] border-primary shadow-md scale-105 ring-2 ring-primary/20"
                    : "bg-white border-moody-border hover:border-primary/40 hover:bg-neutral-50/80"
                }`}
              >
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3">
                  <Image
                    src={mood.image}
                    alt={mood.label}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-moody-text">
                  {mood.label}
                </span>
                <span className="text-[10px] text-moody-muted hidden sm:inline-block mt-0.5">
                  Level {mood.score}/5
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Response Box */}
        <div className="bg-[#FDF6F0] rounded-3xl p-6 sm:p-8 border border-moody-border shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info: Selected Mood & Reflection */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: activeMood.color }}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-moody-muted">
                  Moody&apos;s Immediate Reflection
                </span>
              </div>

              <blockquote className="text-lg sm:text-xl font-medium text-moody-text leading-relaxed">
                &ldquo;{activeMood.reflection}&rdquo;
              </blockquote>

              <div className="pt-3 border-t border-moody-border/80">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
                  <HeartIcon size={14} />
                  Suggested Micro-Action:
                </span>
                <p className="text-sm text-moody-muted mt-1">
                  {activeMood.suggestedAction}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowChatSnippet(!showChatSnippet)}
                  className="text-xs font-semibold text-primary hover:text-primary-dark underline flex items-center gap-1 cursor-pointer"
                >
                  <MessageIcon size={14} />
                  {showChatSnippet ? "Hide AI Conversation" : "Simulate Chat Conversation with Moody"}
                </button>
              </div>
            </div>

            {/* Right Info: Companion Chat Mockup / Audio Advice */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-moody-border shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-moody-border">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-moody-text">Moody AI</span>
                <span className="text-[10px] text-moody-muted ml-auto">Gemini 2.5 Active</span>
              </div>

              {/* Chat bubble simulation */}
              <div className="space-y-3 pt-3 text-xs">
                <div className="bg-[#FDF6F0] p-3 rounded-2xl rounded-tr-xs ml-6 text-moody-text border border-moody-border/60">
                  I&apos;m feeling {activeMood.label.toLowerCase()} today.
                </div>
                <div className="bg-primary-light/20 p-3 rounded-2xl rounded-tl-xs mr-6 text-moody-text border border-primary/20">
                  I hear you. Thank you for checking in with me. Remember, your feelings are signals, not sentences. Would you like to do a quick 2-minute breathing reset or talk through what sparked this?
                </div>
                {showChatSnippet && (
                  <div className="bg-[#FDF6F0] p-3 rounded-2xl rounded-tr-xs ml-6 text-moody-text border border-moody-border/60 animate-in fade-in">
                    I&apos;d love to just vent for a minute and get my thoughts organized.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
