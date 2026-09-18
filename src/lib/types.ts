export type TicketStatus = "pending" | "classified" | "routed";

export type Sentiment = "positive" | "neutral" | "negative";

export interface Ticket {
  id: string;
  content: string;
  status: TicketStatus;
  sentiment: Sentiment | null;
  team_labels: string[] | null;
  actionable: boolean | null;
  external_ticket_ids: Record<string, string> | null;
  created_at: string;
}

export interface ClassificationResult {
  sentiment: Sentiment;
  team_labels: string[];
  actionable: boolean;
}

export interface Report {
  id: string;
  period_start: string | null;
  period_end: string | null;
  sentiment_summary: Record<string, unknown> | null;
  root_cause_clusters: Record<string, unknown> | null;
  created_at: string;
}
