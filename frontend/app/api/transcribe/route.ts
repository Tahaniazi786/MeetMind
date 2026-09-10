import { NextRequest, NextResponse } from "next/server";
import { transcribeAudioWithGemini } from "@/lib/geminiServer";

export const maxDuration = 60; // 60s timeout on Vercel
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided", message: 'Upload an audio file with field name "audio".' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "audio/wav";

    const result = await transcribeAudioWithGemini(buffer, mimeType);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Transcribe API error:", err);
    return NextResponse.json(
      { error: "Transcription failed", message: err.message || "An error occurred during audio transcription" },
      { status: 500 }
    );
  }
}
