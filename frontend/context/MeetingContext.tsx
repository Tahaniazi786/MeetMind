"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ── Types ────────────────────────────────────────────────────────────
export interface ActionItem {
  task: string;
  owner: string;
  deadline: string;
  priority: "high" | "medium" | "low";
}

export interface Decision {
  decision: string;
  made_by: string;
  context: string;
}

export interface SpeakerSentiment {
  speaker: string;
  sentiment: string;
  confidence: number;
}

export interface SentimentAnalysis {
  overall: "positive" | "neutral" | "tense" | "mixed";
  score: number;
  breakdown: SpeakerSentiment[];
}

export interface HealthBreakdown {
  clarity: number;
  decisions_made: number;
  participation: number;
  actionability: number;
}

export interface HealthExplanations {
  clarity: string;
  decisions_made: string;
  participation: string;
  actionability: string;
}

export interface ConflictItem {
  speaker_a: string;
  speaker_b: string;
  topic: string;
  description: string;
}

export interface ConflictDetection {
  has_conflict: boolean;
  conflicts: ConflictItem[];
}

export interface MeetingArchetype {
  type: "decision" | "status_update" | "brainstorm" | "crisis" | "sync";
  label: string;
  emoji: string;
  description: string;
}

export interface MeetingAnalysis {
  tldr: string;
  executive_summary: string;
  detailed_summary: string;
  action_items: ActionItem[];
  decisions: Decision[];
  sentiment_analysis: SentimentAnalysis;
  meeting_health_score: number;
  health_breakdown: HealthBreakdown;
  health_explanations: HealthExplanations;
  conflict_detection: ConflictDetection;
  meeting_archetype: MeetingArchetype;
  key_topics: string[];
  follow_up_email: string;
}

interface MeetingContextType {
  analysis: MeetingAnalysis | null;
  transcript: string;
  isProcessing: boolean;
  processingStep: number;
  isHydrated: boolean;
  setAnalysis: (data: MeetingAnalysis) => void;
  setTranscript: (text: string) => void;
  setIsProcessing: (val: boolean) => void;
  setProcessingStep: (step: number) => void;
  clearAnalysis: () => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

const STORAGE_KEY = "meetmind_analysis";

export function MeetingProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysisState] = useState<MeetingAnalysis | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAnalysisState(JSON.parse(stored));
      }
    } catch {}
    setIsHydrated(true);
  }, []);

  const setAnalysis = (data: MeetingAnalysis) => {
    setAnalysisState(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  };

  const clearAnalysis = () => {
    setAnalysisState(null);
    setTranscript("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <MeetingContext.Provider
      value={{
        analysis,
        transcript,
        isProcessing,
        processingStep,
        isHydrated,
        setAnalysis,
        setTranscript,
        setIsProcessing,
        setProcessingStep,
        clearAnalysis,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeeting() {
  const context = useContext(MeetingContext);
  if (!context) throw new Error("useMeeting must be used within MeetingProvider");
  return context;
}
