import type { RootCauseCluster } from "@/lib/types";
import { TEAM_COLOR_VAR, TEAM_LABEL } from "@/lib/teamColors";

const STATUS_COLOR: Record<string, string> = {
  positive: "var(--status-good)",
  negative: "var(--status-critical)",
  neutral: "var(--text-muted)",
};

export default function RecurringIssues({ clusters }: { clusters: RootCauseCluster[] }) {
  return (
    <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-6">
      <h2 className="text-sm font-medium">Recurring issues</h2>

      {clusters.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          No clusters yet — generate a report once tickets have been classified.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-[var(--gridline)]">
          {clusters.map((c) => (
            <li key={c.label} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: STATUS_COLOR[c.sentiment] }}
                  />
                  <span className="truncate">{c.label}</span>
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5 pl-4">
                  {c.team_labels.map((team) => (
                    <span
                      key={team}
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                      style={{ background: TEAM_COLOR_VAR[team] }}
                    >
                      {TEAM_LABEL[team]}
                    </span>
                  ))}
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-[var(--gridline)] px-2.5 py-1 text-xs font-medium tabular-nums text-[var(--text-secondary)]">
                {c.ticket_count} tickets
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
