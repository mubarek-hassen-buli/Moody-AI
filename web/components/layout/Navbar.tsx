"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Interactive Demo", href: "#demo" },
    { label: "Voice Companion", href: "#voice" },
    { label: "Soundscapes", href: "#soundscapes" },
    { label: "Analytics", href: "#analytics" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FDF6F0]/90 backdrop-blur-md border-b border-moody-border shadow-xs py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform">
            <Image
              src="/images/app.png"
              alt="Moody AI Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-moody-text flex items-center gap-1.5">
              Moody AI <span className="text-sm">🌿</span>
            </span>
            <span className="text-[11px] font-medium text-moody-muted -mt-1 tracking-wide">
              Mental Wellness
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/70 px-4 py-1.5 rounded-full border border-moody-border shadow-xs backdrop-blur-sm">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3.5 py-1.5 text-xs font-medium text-moody-muted hover:text-moody-text hover:bg-black/5 rounded-full transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Button
            href="#download"
            size="sm"
            variant="primary"
            icon={<ArrowRightIcon size={14} />}
          >
            Get the App
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-moody-text hover:bg-black/5"
          aria-label="Toggle Navigation Menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FDF6F0] border-b border-moody-border px-6 py-5 shadow-lg flex flex-col gap-3 animate-in fade-in slide-in-from-top-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-moody-text py-2 border-b border-moody-border/50"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <Button
              href="#download"
              size="md"
              variant="primary"
              className="w-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              Download App
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
