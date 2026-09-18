import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { supabaseAdmin } from "./supabase";
import { TEAM_LABELS } from "./classify";
import { withRetry } from "./withRetry";
import type { Report, RootCauseCluster, Sentiment, Team, Ticket } from "./types";

export type ReportPeriod = number | "all";

// Mirrors the n8n cron reporting workflow (workflow 2 in the build spec):
// pull the period's tickets, aggregate sentiment, cluster root causes, write
// the result to `reports`. Lives here so the demo "generate report" button
// and the future n8n workflow can share the same logic. `period` is either a
// trailing number of days or "all" for the full history.
export async function generateReport(period: ReportPeriod = "all"): Promise<Report> {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured (SUPABASE_SERVICE_ROLE_KEY missing)");
  }

  const periodEnd = new Date();
  const periodStart = period === "all" ? null : new Date(periodEnd.getTime() - period * 24 * 60 * 60 * 1000);

  let query = supabaseAdmin.from("tickets").select("*").lte("created_at", periodEnd.toISOString());
  if (periodStart) query = query.gte("created_at", periodStart.toISOString());
  const { data: tickets, error } = await query;

  if (error) throw error;

  const classified = (tickets ?? []).filter(
    (t): t is Ticket => Boolean(t.sentiment && t.team_labels),
  );

  const breakdown = { positive: 0, neutral: 0, negative: 0 };
  const team_counts: Partial<Record<Team, number>> = {};
  const trendMap: Record<string, { positive: number; neutral: number; negative: number }> = {};

  for (const t of classified) {
    breakdown[t.sentiment as Sentiment]++;

    const day = t.created_at.slice(0, 10);
    trendMap[day] ??= { positive: 0, neutral: 0, negative: 0 };
    trendMap[day][t.sentiment as Sentiment]++;

    for (const team of t.team_labels ?? []) {
      team_counts[team as Team] = (team_counts[team as Team] ?? 0) + 1;
    }
  }

  const trend = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  const topTeamEntry = Object.entries(team_counts).sort((a, b) => b[1] - a[1])[0];
  const top_team = topTeamEntry
    ? { label: topTeamEntry[0] as Team, count: topTeamEntry[1] }
    : null;

  const sentiment_summary = {
    total_tickets: classified.length,
    breakdown,
    team_counts,
    top_team,
    trend,
  };

  const root_cause_clusters = await clusterRootCauses(classified);

  const { data: report, error: insertError } = await supabaseAdmin
    .from("reports")
    .insert({
      period_start: periodStart ? periodStart.toISOString() : null,
      period_end: periodEnd.toISOString(),
      sentiment_summary,
      root_cause_clusters,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return report;
}

async function clusterRootCauses(tickets: Ticket[]): Promise<RootCauseCluster[]> {
  if (tickets.length === 0) return [];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction:
      "You group support tickets into recurring root-cause clusters. Each cluster should represent one distinct underlying issue that shows up across multiple tickets. Give each cluster a short human-readable label (under 8 words), the ids of every ticket that belongs to it, the cluster's dominant sentiment, and the team(s) it should route to. Every ticket id in the input must appear in exactly one cluster — a ticket with a genuinely unique issue gets its own single-ticket cluster.",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          clusters: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                label: { type: SchemaType.STRING },
                ticket_ids: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                },
                sentiment: {
                  type: SchemaType.STRING,
                  format: "enum",
                  enum: ["positive", "neutral", "negative"],
                },
                team_labels: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING, format: "enum", enum: [...TEAM_LABELS] },
                },
              },
              required: ["label", "ticket_ids", "sentiment", "team_labels"],
            },
          },
        },
        required: ["clusters"],
      },
    },
  });

  const input = tickets.map((t) => ({ id: t.id, content: t.content }));
  const result = await withRetry(() =>
    model.generateContent(JSON.stringify(input), { timeout: 30_000 }),
  );
  const parsed = JSON.parse(result.response.text()) as {
    clusters: {
      label: string;
      ticket_ids: string[];
      sentiment: Sentiment;
      team_labels: Team[];
    }[];
  };

  return parsed.clusters
    .map((c) => ({
      label: c.label,
      ticket_count: c.ticket_ids.length,
      sentiment: c.sentiment,
      team_labels: c.team_labels,
    }))
    .sort((a, b) => b.ticket_count - a.ticket_count);
}
