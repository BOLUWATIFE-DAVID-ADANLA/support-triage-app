export default function StatTile({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5">
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p
        className="mt-2 text-3xl font-semibold tracking-tight"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      {sublabel && <p className="mt-1 text-xs text-[var(--text-secondary)]">{sublabel}</p>}
    </div>
  );
}
