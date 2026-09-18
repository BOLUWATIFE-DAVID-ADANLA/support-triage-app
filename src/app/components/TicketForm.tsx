"use client";

import { useState } from "react";
import type { ClassificationResult } from "@/lib/types";

type SubmitResult =
  | { kind: "classified"; data: ClassificationResult & { id: string } }
  | { kind: "error"; message: string };

export default function TicketForm() {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/submit-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setResult({ kind: "error", message: data.error ?? "Something went wrong" });
      } else {
        setResult({ kind: "classified", data });
        setContent("");
      }
    } catch {
      setResult({ kind: "error", message: "Network error — please try again" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe the issue the customer is reporting..."
          rows={5}
          className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Classifying..." : "Submit ticket"}
        </button>
      </form>

      {result?.kind === "classified" && (
        <div className="mt-4 rounded-lg border border-black/10 dark:border-white/15 p-4 text-sm">
          <p className="font-medium mb-2">Classified</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="opacity-60">Sentiment</dt>
            <dd>{result.data.sentiment}</dd>
            <dt className="opacity-60">Teams</dt>
            <dd>{result.data.team_labels.join(", ")}</dd>
            <dt className="opacity-60">Actionable</dt>
            <dd>{result.data.actionable ? "Yes" : "No"}</dd>
          </dl>
        </div>
      )}

      {result?.kind === "error" && (
        <p className="mt-4 text-sm text-red-600">{result.message}</p>
      )}
    </div>
  );
}
