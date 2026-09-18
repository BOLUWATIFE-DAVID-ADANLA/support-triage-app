import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Dev-only convenience: seeds fake `reports` rows so the dashboard looks
// alive before the real cron reporting workflow has accumulated volume.
export async function POST() {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase is not configured (SUPABASE_SERVICE_ROLE_KEY missing)" },
      { status: 500 },
    );
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const fakeReport = {
    period_start: weekAgo.toISOString(),
    period_end: now.toISOString(),
    sentiment_summary: {
      total_tickets: 128,
      breakdown: { positive: 41, neutral: 52, negative: 35 },
      trend: [
        { date: daysAgo(6), positive: 5, neutral: 8, negative: 4 },
        { date: daysAgo(5), positive: 6, neutral: 7, negative: 6 },
        { date: daysAgo(4), positive: 4, neutral: 9, negative: 5 },
        { date: daysAgo(3), positive: 7, neutral: 6, negative: 4 },
        { date: daysAgo(2), positive: 8, neutral: 8, negative: 6 },
        { date: daysAgo(1), positive: 6, neutral: 7, negative: 5 },
        { date: daysAgo(0), positive: 5, neutral: 7, negative: 5 },
      ],
    },
    root_cause_clusters: [
      {
        label: "Checkout fails on mobile Safari",
        ticket_count: 14,
        sentiment: "negative",
        team_labels: ["engineering"],
      },
      {
        label: "Confusion about refund timeline",
        ticket_count: 11,
        sentiment: "negative",
        team_labels: ["billing"],
      },
      {
        label: "Requests for dark mode",
        ticket_count: 9,
        sentiment: "neutral",
        team_labels: ["product"],
      },
      {
        label: "Praise for new onboarding flow",
        ticket_count: 7,
        sentiment: "positive",
        team_labels: ["product"],
      },
    ],
  };

  const { data, error } = await supabaseAdmin
    .from("reports")
    .insert(fakeReport)
    .select()
    .single();

  if (error) {
    console.error("seed report error", error);
    return NextResponse.json({ error: "failed to seed report" }, { status: 500 });
  }

  return NextResponse.json(data);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
