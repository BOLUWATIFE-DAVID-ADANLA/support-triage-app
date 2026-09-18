import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { Report } from "@/lib/types";
import { TEAM_LABEL } from "@/lib/teamColors";
import SeedButton from "./SeedButton";
import PeriodPicker from "./PeriodPicker";
import StatTile from "./components/StatTile";
import SentimentSection from "./components/SentimentSection";
import TeamBreakdown from "./components/TeamBreakdown";
import RecurringIssues from "./components/RecurringIssues";

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

// Maps a stored report's period_start/period_end back to one of the
// PeriodPicker presets, so the picker highlights what's currently shown.
function derivePeriodKey(report: Report): string {
  if (!report.period_start) return "all";
  const start = new Date(report.period_start).getTime();
  const end = new Date(report.period_end ?? Date.now()).getTime();
  const days = Math.round((end - start) / (24 * 60 * 60 * 1000));
  return [7, 30, 90].includes(days) ? String(days) : "all";
}

export default async function Dashboard() {
  const report = await getLatestReport();

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Support ticket report</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Sentiment trends and recurring issues across support tickets.
            </p>
          </div>
          {report && <PeriodPicker current={derivePeriodKey(report)} />}
        </div>

        {!report ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-6 text-sm">
            <p className="text-[var(--text-secondary)]">
              No reports yet. The cron reporting workflow writes here — or seed sample
              tickets and generate one now to preview the dashboard.
            </p>
            <SeedButton />
          </div>
        ) : (
          <ReportView report={report} />
        )}
      </div>
    </main>
  );
}

function ReportView({ report }: { report: Report }) {
  const summary = report.sentiment_summary;
  const clusters = report.root_cause_clusters ?? [];

  if (!summary) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Report has no sentiment data yet.
      </p>
    );
  }

  const actionable = clusters
    .filter((c) => c.team_labels.includes("engineering"))
    .reduce((sum, c) => sum + c.ticket_count, 0);

  return (
    <div className="flex flex-col gap-8">
      <p className="text-xs text-[var(--text-muted)]">
        {report.period_start ? report.period_start.slice(0, 10) : "All time"}
        {report.period_start && ` → ${report.period_end?.slice(0, 10)}`}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total tickets" value={String(summary.total_tickets)} />
        <StatTile
          label="Top team"
          value={summary.top_team ? TEAM_LABEL[summary.top_team.label] : "—"}
          sublabel={summary.top_team ? `${summary.top_team.count} tickets` : undefined}
        />
        <StatTile
          label="Negative sentiment"
          value={`${
            summary.total_tickets > 0
              ? Math.round((summary.breakdown.negative / summary.total_tickets) * 100)
              : 0
          }%`}
          sublabel={`${summary.breakdown.negative} tickets`}
          accent="var(--status-critical)"
        />
      </div>

      <SentimentSection summary={summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TeamBreakdown
          teamCounts={summary.team_counts}
          topTeam={summary.top_team?.label ?? null}
        />
        <RecurringIssues clusters={clusters} />
      </div>

      {actionable > 0 && (
        <p className="text-xs text-[var(--text-muted)]">
          {actionable} tickets across recurring issues are flagged actionable for engineering.
        </p>
      )}
    </div>
  );
}
