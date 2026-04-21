import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import { MeetingProvider } from "@/context/MeetingContext";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MeetMind — AI Meeting Intelligence",
  description:
    "Transform raw meeting transcripts into structured, actionable intelligence. Summaries, action items, sentiment analysis, and more — powered by AI.",
  keywords: ["meeting", "AI", "transcript", "summary", "action items", "sentiment"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`}>
      <body className="bg-bg text-text font-display min-h-screen">
        <MeetingProvider>{children}</MeetingProvider>
      </body>
    </html>
  );
}
