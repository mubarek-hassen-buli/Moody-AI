import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { InteractiveDemo } from "@/components/sections/InteractiveDemo";
import { FeaturesGrid } from "@/components/sections/FeaturesGrid";
import { VoiceShowcase } from "@/components/sections/VoiceShowcase";
import { Soundscapes } from "@/components/sections/Soundscapes";
import { AnalyticsPreview } from "@/components/sections/AnalyticsPreview";
import { DownloadCTA } from "@/components/sections/DownloadCTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Landing Page Flow */}
      <main className="flex-1">
        {/* 1. Hero Section with Interactive App Preview */}
        <Hero />

        {/* 2. Interactive Mood Check-In Experience */}
        <InteractiveDemo />

        {/* 3. Core Capabilities Grid */}
        <FeaturesGrid />

        {/* 4. Voice Experience: Real-Time Calls & Journaling */}
        <VoiceShowcase />

        {/* 5. Soundscapes & Guided Movement Sessions */}
        <Soundscapes />

        {/* 6. Scientific Emotional Analytics & Trends */}
        <AnalyticsPreview />

        {/* 7. Download Action & Conversion */}
        <DownloadCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
