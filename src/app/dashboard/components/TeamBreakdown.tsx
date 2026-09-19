import type { Team } from "@/lib/types";
import { TEAM_COLOR_VAR, TEAM_LABEL } from "@/lib/teamColors";

export default function TeamBreakdown({
  teamCounts,
  topTeam,
}: {
  teamCounts: Partial<Record<Team, number>>;
  topTeam: Team | null;
}) {
  const entries = (Object.entries(teamCounts ?? {}) as [Team, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const max = Math.max(1, ...entries.map(([, count]) => count));

  return (
    <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-6">
      <h2 className="text-sm font-medium">Tickets by team</h2>

      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]">No routed tickets yet.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {entries.map(([team, count]) => (
            <div key={team} className="flex items-center gap-3 text-sm">
              <span className="flex w-36 shrink-0 items-center gap-1.5 text-[var(--text-secondary)]">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: TEAM_COLOR_VAR[team] }}
                />
                <span className="truncate">{TEAM_LABEL[team]}</span>
                {team === topTeam && (
                  <span className="shrink-0 rounded-full bg-[var(--gridline)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
                    top
                  </span>
                )}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--gridline)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(count / max) * 100}%`, background: TEAM_COLOR_VAR[team] }}
                />
              </div>
              <span className="w-8 shrink-0 text-right tabular-nums text-[var(--text-secondary)]">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
