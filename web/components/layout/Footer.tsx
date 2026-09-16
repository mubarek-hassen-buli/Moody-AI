import React from "react";
import Image from "next/image";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-moody-border py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-moody-border">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-xs">
                <Image
                  src="/images/app.png"
                  alt="Moody AI Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-lg font-bold text-moody-text">Moody AI 🌿</span>
            </div>
            <p className="text-sm text-moody-muted max-w-sm leading-relaxed">
              Your daily emotional intelligence partner. Track your moods, converse with your AI wellness companion, reflect with voice journaling, and discover your emotional rhythms.
            </p>
            <div className="text-xs text-moody-tertiary">
              Built with React Native, Expo SDK 54, NestJS, Drizzle ORM, Neon, Supabase & Google Gemini.
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-moody-text">
              Navigation
            </h5>
            <ul className="space-y-2 text-sm text-moody-muted">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Core Features
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-primary transition-colors">
                  Interactive Check-in
                </a>
              </li>
              <li>
                <a href="#voice" className="hover:text-primary transition-colors">
                  Voice Calling & Journal
                </a>
              </li>
              <li>
                <a href="#soundscapes" className="hover:text-primary transition-colors">
                  Soundscapes & Workouts
                </a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-primary transition-colors">
                  Weekly Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Principles */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-moody-text">
              Privacy & Trust
            </h5>
            <p className="text-xs text-moody-muted leading-relaxed">
              Your mental health journey is private. Mood entries and voice transcripts are encrypted and never sold, shared, or used for third-party advertising.
            </p>
            <div className="pt-2 flex gap-4 text-xs font-semibold text-primary">
              <a href="#download" className="hover:underline">
                Download Mobile App
              </a>
              <span>•</span>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Open Source (MIT)
              </a>
            </div>
          </div>
        </div>

        {/* Mental Health Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-moody-tertiary">
          <p className="max-w-2xl leading-relaxed text-center sm:text-left">
            <span className="font-semibold text-moody-muted">Medical Disclaimer:</span> Moody AI is an emotional tracking and wellness reflection tool. It does not provide clinical diagnosis or medical therapy. If you are facing severe distress or a mental health emergency, please reach out to local emergency services or a licensed therapist.
          </p>
          <p className="shrink-0">
            © {new Date().getFullYear()} Moody AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
