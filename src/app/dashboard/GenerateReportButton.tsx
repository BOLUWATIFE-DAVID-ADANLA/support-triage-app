"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Generates a report from whatever tickets currently exist in the DB — no
// fake/demo data involved.
export default function GenerateReportButton({
  label = "Generate report",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/generate", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate report");
      router.refresh();
    } catch {
      setError("Something went wrong — check the server logs.");
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="underline decoration-dotted underline-offset-2 hover:text-[var(--text-primary)] disabled:opacity-50"
      >
        {loading ? "Working…" : label}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="self-start rounded-lg bg-[var(--cat-engineering)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Working…" : label}
      </button>
      {error && (
        <p className="text-sm" style={{ color: "var(--status-critical)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
