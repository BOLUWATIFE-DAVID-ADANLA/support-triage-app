"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SeedButton({ label = "Seed sample tickets" }: { label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const seedRes = await fetch("/api/tickets/seed", { method: "POST" });
      if (!seedRes.ok) throw new Error("Failed to seed tickets");

      const reportRes = await fetch("/api/reports/generate", { method: "POST" });
      if (!reportRes.ok) throw new Error("Failed to generate report");

      router.refresh();
    } catch {
      setError("Something went wrong — check the server logs.");
    } finally {
      setLoading(false);
    }
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
