"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMeeting, MeetingAnalysis } from "@/context/MeetingContext";

export default function DemoPage() {
  const router = useRouter();
  const { setAnalysis, setTranscript } = useMeeting();
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDemo() {
      try {
        const res = await fetch("/demo-analysis.json");
        if (!res.ok) throw new Error("Failed to load demo data");
        const data: MeetingAnalysis = await res.json();
        setTranscript("Demo transcript loaded — pre-analyzed sample meeting for preview.");
        setAnalysis(data);
        router.replace("/results");
      } catch (err) {
        console.error("Demo load error:", err);
        setError("Failed to load demo data. Please try again.");
      }
    }
    loadDemo();
  }, [setAnalysis, setTranscript, router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🧠</div>
        {error ? (
          <p className="font-mono text-status-high">{error}</p>
        ) : (
          <p className="font-mono text-text-muted">Loading demo data…</p>
        )}
      </div>
    </div>
  );
}
