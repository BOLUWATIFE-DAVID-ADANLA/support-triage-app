"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PERIODS: { label: string; value: number | "all" }[] = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
  { label: "All time", value: "all" },
];

export default function PeriodPicker({ current }: { current: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function pick(value: number | "all") {
    const key = String(value);
    if (pending) return;
    setPending(key);
    try {
      await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: value }),
      });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--border-hairline)] p-1 text-xs">
      {PERIODS.map((p) => {
        const key = String(p.value);
        const active = current === key;
        return (
          <button
            key={key}
            onClick={() => pick(p.value)}
            disabled={pending !== null}
            className={`rounded-md px-2.5 py-1 font-medium transition disabled:opacity-50 ${
              active
                ? "bg-[var(--cat-engineering)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {pending === key ? "…" : p.label}
          </button>
        );
      })}
    </div>
  );
}
