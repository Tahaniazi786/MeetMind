import { NextRequest, NextResponse } from "next/server";
import { analyzeMeetingWithGemini } from "@/lib/geminiServer";

export const maxDuration = 60; // 60s timeout on Vercel
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Missing transcript", message: 'Provide a "transcript" string in the request body.' },
        { status: 400 }
      );
    }

    if (transcript.trim().length < 20) {
      return NextResponse.json(
        { error: "Transcript too short", message: "The transcript must be at least 20 characters long." },
        { status: 400 }
      );
    }

    const analysis = await analyzeMeetingWithGemini(transcript);
    return NextResponse.json(analysis);
  } catch (err: any) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "Analysis failed", message: err.message || "An error occurred during meeting analysis" },
      { status: 500 }
    );
  }
}
