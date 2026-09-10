import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "MeetMind Unified Serverless API (Vercel + Google Gemini)",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
}
