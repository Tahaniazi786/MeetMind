"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMeeting, MeetingAnalysis } from "@/context/MeetingContext";

const MOCK: MeetingAnalysis = {
  tldr: "The team discussed Q4 roadmap priorities and budget allocation. Key decisions were made about mobile-first strategy and hiring timeline.",
  executive_summary: "In this meeting, the team reviewed Q4 priorities focusing on mobile app development. Sarah proposed a mobile-first approach which was unanimously approved. Budget of $250K was confirmed for the mobile initiative. John raised timeline concerns but agreed after resource commitments were made. The team decided to hire two additional frontend developers by end of October.",
  detailed_summary: "The product planning meeting covered Q4 roadmap prioritization with all key stakeholders present — Sarah (VP Product), John (Engineering Lead), Maria (Design Lead), and Tom (Marketing Director). Sarah presented data showing 68% of user traffic now comes from mobile devices, making a compelling case for mobile-first strategy. John initially had concerns about timeline compression but Maria proposed a phased approach: MVP by November 15th, followed by iterative improvements. Budget discussions resulted in a $250K allocation, with $150K earmarked for two new frontend developer hires and $100K for infrastructure and tooling. The team agreed to weekly check-ins every Monday at 10 AM.",
  action_items: [
    { task: "Draft mobile app MVP specification document", owner: "Sarah", deadline: "Oct 15, 2024", priority: "high" },
    { task: "Post job listings for 2 frontend developers", owner: "John", deadline: "Oct 10, 2024", priority: "high" },
    { task: "Create mobile UI design mockups", owner: "Maria", deadline: "Oct 20, 2024", priority: "medium" },
    { task: "Prepare December launch marketing plan", owner: "Tom", deadline: "Nov 1, 2024", priority: "medium" },
    { task: "Set up mobile CI/CD pipeline", owner: "John", deadline: "Oct 25, 2024", priority: "low" },
    { task: "Conduct user research for mobile features", owner: "Maria", deadline: "Oct 18, 2024", priority: "low" },
  ],
  decisions: [
    { decision: "Adopt mobile-first development strategy for Q4", made_by: "Sarah", context: "68% of user traffic comes from mobile devices" },
    { decision: "Allocate $250K budget for mobile initiative", made_by: "Sarah", context: "Approved by finance, includes hiring and infrastructure" },
    { decision: "Hire 2 frontend developers by end of October", made_by: "John", context: "Current team capacity insufficient for mobile + API work" },
    { decision: "Target December 1st for marketing launch", made_by: "Tom", context: "Aligns with holiday shopping season and prepared campaign" },
  ],
  sentiment_analysis: {
    overall: "positive",
    score: 78,
    breakdown: [
      { speaker: "Sarah", sentiment: "positive", confidence: 0.92 },
      { speaker: "John", sentiment: "neutral", confidence: 0.65 },
      { speaker: "Maria", sentiment: "positive", confidence: 0.88 },
      { speaker: "Tom", sentiment: "positive", confidence: 0.85 },
    ],
  },
  meeting_health_score: 85,
  health_breakdown: { clarity: 22, decisions_made: 23, participation: 20, actionability: 20 },
  health_explanations: {
    clarity: "Communication was mostly clear with 2 ambiguous directives around timeline specifics",
    decisions_made: "4 concrete decisions were reached, each with clear ownership",
    participation: "John dominated ~45% of speaking time; Maria and Tom had limited contributions",
    actionability: "6 clear action items with owners assigned, though 2 lack specific deadlines",
  },
  conflict_detection: {
    has_conflict: true,
    conflicts: [
      {
        speaker_a: "John",
        speaker_b: "Sarah",
        topic: "timeline compression",
        description: "John expressed strong concerns about the aggressive Q4 timeline, pushing back on Sarah's proposed delivery date before reaching a compromise.",
      },
    ],
  },
  meeting_archetype: {
    type: "decision",
    label: "Decision Meeting",
    emoji: "🔴",
    description: "4 major strategic decisions were made with budget commitments",
  },
  key_topics: ["mobile app", "Q4 roadmap", "budget", "hiring", "frontend", "MVP", "marketing launch", "design mockups", "CI/CD", "timeline", "API migration", "resources", "December launch", "weekly standup", "strategy"],
  follow_up_email: "Subject: Q4 Product Planning - Summary & Action Items\n\nHi Team,\n\nThank you for a productive planning session today. Here are the key outcomes:\n\nDecisions Made:\n• Mobile-first strategy adopted for Q4\n• $250K budget allocated (hiring + infrastructure)\n• Hiring 2 frontend developers by end of October\n• Marketing launch targeted for December 1st\n\nAction Items:\n• Sarah → Draft MVP spec by Oct 15\n• John → Post frontend dev listings by Oct 10\n• Maria → UI mockups by Oct 20\n• Tom → Marketing plan by Nov 1\n• John → CI/CD pipeline by Oct 25\n• Maria → User research by Oct 18\n\nWeekly check-ins start Monday at 10 AM.\n\nPlease reach out if you have any questions.\n\nBest regards,\nMeetMind AI Assistant",
};

export default function DemoPage() {
  const router = useRouter();
  const { setAnalysis, setTranscript } = useMeeting();

  useEffect(() => {
    setTranscript("Demo transcript loaded for preview purposes.");
    setAnalysis(MOCK);
    router.replace("/results");
  }, [setAnalysis, setTranscript, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="font-mono text-text-muted">Loading demo data…</p>
    </div>
  );
}
