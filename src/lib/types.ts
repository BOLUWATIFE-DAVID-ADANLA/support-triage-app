export type TicketStatus = "pending" | "classified" | "routed";

export type Sentiment = "positive" | "neutral" | "negative";

export type Team = "engineering" | "billing" | "account" | "product" | "support";

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

export interface SentimentSummary {
  total_tickets: number;
  breakdown: { positive: number; neutral: number; negative: number };
  team_counts: Partial<Record<Team, number>>;
  top_team: { label: Team; count: number } | null;
  trend: { date: string; positive: number; neutral: number; negative: number }[];
}

export interface RootCauseCluster {
  label: string;
  ticket_count: number;
  sentiment: Sentiment;
  team_labels: Team[];
}

export interface Report {
  id: string;
  period_start: string | null;
  period_end: string | null;
  sentiment_summary: SentimentSummary | null;
  root_cause_clusters: RootCauseCluster[] | null;
  created_at: string;
}
