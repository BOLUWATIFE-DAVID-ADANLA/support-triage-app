import { NextResponse } from "next/server";
import { seedTickets } from "@/lib/seedTickets";

// Dev-only convenience: seeds realistic pre-existing tickets so the
// reporting pipeline has real data to aggregate. No-op if tickets already exist.
export async function POST() {
  try {
    const result = await seedTickets();
    return NextResponse.json(result);
  } catch (err) {
    console.error("seed tickets error", err);
    return NextResponse.json({ error: "failed to seed tickets" }, { status: 500 });
  }
}
