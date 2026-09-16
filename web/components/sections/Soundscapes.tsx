"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AUDIO_COLLECTIONS } from "@/lib/constants";
import { PlayIcon, PauseIcon } from "@/components/ui/Icons";

export const Soundscapes: React.FC = () => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [playingTrackTitle, setPlayingTrackTitle] = useState<string | null>(null);

  const activeCollection = AUDIO_COLLECTIONS[activeCategoryIndex];

  const toggleTrack = (title: string) => {
    if (playingTrackTitle === title) {
      setPlayingTrackTitle(null);
    } else {
      setPlayingTrackTitle(title);
    }
  };

  return (
    <section id="soundscapes" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Audio Wellness Library
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-moody-text mt-2">
          Sound that adapts to your mood.
        </h2>
        <p className="text-sm sm:text-base text-moody-muted mt-3">
          Whether you need stillness to soothe a racing heart or an upbeat rhythm to shake off lethargy,
          Moody&apos;s audio tracks are built for instant emotional shifts.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex justify-center gap-3 mb-10">
        {AUDIO_COLLECTIONS.map((col, idx) => {
          const isActive = idx === activeCategoryIndex;
          return (
            <button
              key={col.category}
              onClick={() => {
                setActiveCategoryIndex(idx);
                setPlayingTrackTitle(null);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-sm scale-105"
                  : "bg-white text-moody-muted border border-moody-border hover:text-moody-text"
              }`}
            >
              {col.category}
            </button>
          );
        })}
      </div>

      {/* Showcase Card */}
      <div className="bg-white rounded-3xl border border-moody-border overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Atmospheric Photography */}
          <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-[440px]">
            <Image
              src={activeCollection.image}
              alt={activeCollection.category}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8 text-white">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-light mb-1">
                Category
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold">
                {activeCollection.category}
              </h3>
              <p className="text-sm text-white/80 mt-1 max-w-md leading-relaxed">
                {activeCollection.subtitle}
              </p>
            </div>
          </div>

          {/* Right Column: Track List */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-moody-border">
              <span className="text-xs font-bold uppercase tracking-wider text-moody-muted">
                Curated Sessions
              </span>
              <span className="text-xs font-medium text-primary">
                3 Minutes Each
              </span>
            </div>

            <div className="space-y-3">
              {activeCollection.tracks.map((track) => {
                const isPlaying = playingTrackTitle === track.title;
                return (
                  <div
                    key={track.title}
                    onClick={() => toggleTrack(track.title)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      isPlaying
                        ? "bg-moody-soft border-primary/40 shadow-xs"
                        : "bg-neutral-50/70 border-moody-border/80 hover:bg-neutral-50 hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <button
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                          isPlaying
                            ? "bg-primary text-white scale-105"
                            : "bg-white text-moody-text border border-moody-border"
                        }`}
                        aria-label={isPlaying ? "Pause track" : "Play track"}
                      >
                        {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
                      </button>
                      <div>
                        <h4 className="text-sm font-bold text-moody-text">
                          {track.title}
                        </h4>
                        <p className="text-xs text-moody-muted">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isPlaying && (
                        <div className="flex items-center gap-0.5 h-4">
                          <span className="w-1 bg-primary rounded-full animate-bounce h-2" />
                          <span className="w-1 bg-primary rounded-full animate-bounce h-4 delay-100" />
                          <span className="w-1 bg-primary rounded-full animate-bounce h-3 delay-200" />
                        </div>
                      )}
                      <span className="text-xs font-medium text-moody-muted">
                        {track.duration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-xs text-moody-muted italic text-center">
              Tap any track to simulate background playback with waveform animation.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
