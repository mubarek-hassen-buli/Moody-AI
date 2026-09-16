import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#F07033",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://moody-ai.app"),
  title: "Moody AI 🌿 — Intelligent Mental Wellness & Mood Companion",
  description:
    "Moody AI is your empathetic daily emotional partner. Track your moods, converse with real-time AI voice companions, transcribe voice journals, and discover personal emotional trends.",
  icons: {
    icon: "/images/app.png",
    apple: "/images/app.png",
  },
  openGraph: {
    title: "Moody AI — Your Emotional Wellness Companion",
    description:
      "Daily mood tracking, real-time AI voice calling, speech-to-text journaling, and personalized emotional analytics.",
    images: ["/images/app.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} scroll-smooth`}>
      <body className="min-h-screen bg-warm-pattern text-moody-text antialiased selection:bg-primary-light selection:text-moody-text">
        {children}
      </body>
    </html>
  );
}
