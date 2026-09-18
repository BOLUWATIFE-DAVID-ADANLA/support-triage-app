import type { SentimentSummary } from "@/lib/types";

const STATUS = {
  positive: { color: "var(--status-good)", label: "Positive" },
  neutral: { color: "var(--text-muted)", label: "Neutral" },
  negative: { color: "var(--status-critical)", label: "Negative" },
} as const;

export default function SentimentSection({ summary }: { summary: SentimentSummary }) {
  const { breakdown, total_tickets, trend } = summary;

  return (
    <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-6">
      <h2 className="text-sm font-medium">Sentiment</h2>

      <div className="mt-4 flex flex-col gap-3">
        {(["positive", "neutral", "negative"] as const).map((key) => (
          <SentimentBar
            key={key}
            label={STATUS[key].label}
            color={STATUS[key].color}
            count={breakdown[key]}
            total={total_tickets}
          />
        ))}
      </div>

      {trend.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            {(["positive", "neutral", "negative"] as const).map((key) => (
              <span key={key} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: STATUS[key].color }}
                />
                {STATUS[key].label}
              </span>
            ))}
          </div>
          <TrendChart trend={trend} />
        </div>
      )}
    </section>
  );
}

function SentimentBar({
  label,
  color,
  count,
  total,
}: {
  label: string;
  color: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex w-20 shrink-0 items-center gap-1.5 text-[var(--text-secondary)]">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--gridline)]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="w-16 shrink-0 text-right tabular-nums text-[var(--text-secondary)]">
        {count} ({pct}%)
      </span>
    </div>
  );
}

function TrendChart({
  trend,
}: {
  trend: { date: string; positive: number; neutral: number; negative: number }[];
}) {
  const max = Math.max(1, ...trend.map((d) => d.positive + d.neutral + d.negative));
  const CHART_HEIGHT = 128; // px, matches h-32 on the container below

  return (
    <div className="mt-3">
      <div className="flex items-end gap-2" style={{ height: CHART_HEIGHT }}>
        {trend.map((d) => {
          const dayTotal = d.positive + d.neutral + d.negative;
          const barHeight = dayTotal > 0 ? Math.max(4, (dayTotal / max) * CHART_HEIGHT) : 0;
          return (
            <div key={d.date} className="flex flex-1 items-end justify-center">
              <div
                className="flex w-full flex-col-reverse gap-0.5 overflow-hidden rounded-t"
                style={{ height: barHeight }}
                title={`${d.date} — ${d.positive} positive, ${d.neutral} neutral, ${d.negative} negative`}
              >
                <Segment value={d.positive} dayTotal={dayTotal} color={STATUS.positive.color} />
                <Segment value={d.neutral} dayTotal={dayTotal} color={STATUS.neutral.color} />
                <Segment value={d.negative} dayTotal={dayTotal} color={STATUS.negative.color} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-2">
        {trend.map((d) => (
          <span
            key={d.date}
            className="flex-1 text-center text-[10px] text-[var(--text-muted)]"
          >
            {d.date.slice(5)}
          </span>
        ))}
      </div>
    </div>
  );
}

function Segment({
  value,
  dayTotal,
  color,
}: {
  value: number;
  dayTotal: number;
  color: string;
}) {
  if (value === 0) return null;
  const heightPct = dayTotal > 0 ? (value / dayTotal) * 100 : 0;
  return <div className="w-full" style={{ height: `${heightPct}%`, background: color }} />;
}
