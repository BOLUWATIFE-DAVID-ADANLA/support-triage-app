import { NextRequest, NextResponse } from "next/server";
import { generateReport, type ReportPeriod } from "@/lib/report";

// Stands in for the n8n cron reporting workflow: aggregates sentiment and
// clusters root causes from the current tickets, writes the result to `reports`.
// Body: { period?: number | "all" } — a trailing number of days, or "all" (default).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const period: ReportPeriod = body?.period === "all" || !body?.period
    ? "all"
    : Number(body.period);

  try {
    const report = await generateReport(period);
    return NextResponse.json(report);
  } catch (err) {
    console.error("generate report error", err);
    return NextResponse.json({ error: "failed to generate report" }, { status: 500 });
  }
}
