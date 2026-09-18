import Link from "next/link";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { Report } from "@/lib/types";
import SeedButton from "./SeedButton";

export const dynamic = "force-dynamic";

async function getLatestReport(): Promise<Report | null> {
  const client = supabaseAdmin ?? supabase;
  const { data, error } = await client
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("fetch report error", error);
    return null;
  }
  return data;
}

export default async function Dashboard() {
  const report = await getLatestReport();

  return (
    <main className="flex-1 flex flex-col items-center gap-8 px-6 py-16">
      <div className="w-full max-w-3xl flex items-center justify-between">
        <h1 className="text-xl font-semibold">Support ticket report</h1>
        <Link href="/" className="text-sm underline opacity-70">
          Submit a ticket
        </Link>
      </div>

      {!report ? (
        <div className="w-full max-w-3xl rounded-lg border border-black/10 dark:border-white/15 p-6 text-sm flex flex-col gap-3">
          <p className="opacity-70">
            No reports yet. The cron reporting workflow writes here — or seed
            fake data to preview the dashboard.
          </p>
          <SeedButton />
        </div>
      ) : (
        <ReportView report={report} />
      )}
    </main>
  );
}

function ReportView({ report }: { report: Report }) {
  const summary = report.sentiment_summary as {
    total_tickets?: number;
    breakdown?: { positive: number; neutral: number; negative: number };
    trend?: { date: string; positive: number; neutral: number; negative: number }[];
  } | null;

  const clusters = (report.root_cause_clusters ?? []) as {
    label: string;
    ticket_count: number;
    sentiment: string;
    team_labels: string[];
  }[];

  const breakdown = summary?.breakdown;
  const total = summary?.total_tickets ?? 0;

  return (
    <div className="w-full max-w-3xl flex flex-col gap-8">
      <section className="rounded-lg border border-black/10 dark:border-white/15 p-6">
        <p className="text-sm opacity-60 mb-4">
          {report.period_start?.slice(0, 10)} → {report.period_end?.slice(0, 10)} ·{" "}
          {total} tickets
        </p>

        {breakdown && (
          <div className="flex flex-col gap-2">
            <SentimentBar label="Positive" count={breakdown.positive} total={total} color="bg-green-500" />
            <SentimentBar label="Neutral" count={breakdown.neutral} total={total} color="bg-slate-400" />
            <SentimentBar label="Negative" count={breakdown.negative} total={total} color="bg-red-500" />
          </div>
        )}
      </section>

      <section className="rounded-lg border border-black/10 dark:border-white/15 p-6">
        <h2 className="text-sm font-medium mb-4">Recurring issues</h2>
        <ul className="flex flex-col gap-3">
          {clusters.map((c) => (
            <li key={c.label} className="flex items-center justify-between text-sm">
              <div>
                <p>{c.label}</p>
                <p className="opacity-60 text-xs">
                  {c.team_labels.join(", ")} · {c.sentiment}
                </p>
              </div>
              <span className="text-xs rounded-full bg-black/5 dark:bg-white/10 px-2 py-1">
                {c.ticket_count} tickets
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SentimentBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-16 shrink-0 opacity-70">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right opacity-70">{pct}%</span>
    </div>
  );
}
