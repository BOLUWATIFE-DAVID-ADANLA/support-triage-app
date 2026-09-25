"use client";

import { useState } from "react";
import type { ClassificationResult } from "@/lib/types";
import { MAX_TICKET_CONTENT_LENGTH } from "@/lib/constants";

type SubmitResult =
  | { kind: "classified"; data: ClassificationResult & { id: string } }
  | { kind: "error"; message: string };

const SENTIMENT_COLOR: Record<string, string> = {
  positive: "var(--status-good)",
  negative: "var(--status-critical)",
  neutral: "var(--text-muted)",
};

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
          maxLength={MAX_TICKET_CONTENT_LENGTH}
          className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-3 text-sm outline-none transition focus:ring-2 focus:ring-[var(--cat-engineering)]"
        />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="self-start rounded-lg bg-[var(--cat-engineering)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Classifying..." : "Submit ticket"}
          </button>
          <span className="text-xs text-[var(--text-muted)]">
            {content.length}/{MAX_TICKET_CONTENT_LENGTH}
          </span>
        </div>
      </form>

      {result?.kind === "classified" && (
        <div className="mt-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4 text-sm">
          <p className="mb-3 font-medium">Classified</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <dt className="text-[var(--text-muted)]">Sentiment</dt>
            <dd className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: SENTIMENT_COLOR[result.data.sentiment] }}
              />
              {result.data.sentiment}
            </dd>
            <dt className="text-[var(--text-muted)]">Teams</dt>
            <dd>{result.data.team_labels.join(", ")}</dd>
            <dt className="text-[var(--text-muted)]">Actionable</dt>
            <dd>{result.data.actionable ? "Yes" : "No"}</dd>
          </dl>
        </div>
      )}

      {result?.kind === "error" && (
        <p className="mt-4 text-sm" style={{ color: "var(--status-critical)" }}>
          {result.message}
        </p>
      )}
    </div>
  );
}
