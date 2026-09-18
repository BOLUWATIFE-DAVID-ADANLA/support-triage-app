import { NextRequest, NextResponse } from "next/server";
import { classifyTicket } from "@/lib/classify";

// Single source of truth for classification. Called synchronously by the
// demo-mode submit route, and over HTTP by the n8n routing workflow so the
// prompt/logic lives in one place instead of being duplicated in an n8n node.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const content = body?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "content (string) is required" },
      { status: 400 },
    );
  }

  try {
    const result = await classifyTicket(content);
    return NextResponse.json(result);
  } catch (err) {
    console.error("classify error", err);
    return NextResponse.json(
      { error: "classification failed" },
      { status: 500 },
    );
  }
}
