import { supabaseAdmin } from "./supabase";
import { SEED_TICKETS } from "./seedData";

// Seeds realistic pre-existing tickets, already classified/routed, spread
// over the trailing 7 days — so the reporting pipeline has real rows to
// aggregate instead of a hand-written fake report. Idempotent: skips if
// tickets already exist so repeated clicks don't pile up duplicates.
export async function seedTickets(): Promise<{ inserted: number }> {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured (SUPABASE_SERVICE_ROLE_KEY missing)");
  }

  const { count, error: countError } = await supabaseAdmin
    .from("tickets")
    .select("id", { count: "exact", head: true });

  if (countError) throw countError;
  if ((count ?? 0) > 0) return { inserted: 0 };

  const now = Date.now();
  const rows = SEED_TICKETS.map((t) => {
    const external_ticket_ids: Record<string, string> = {};
    if (t.team_labels.includes("engineering")) {
      external_ticket_ids.linear = `ENG-${100 + Math.floor(Math.random() * 900)}`;
    }
    if (t.team_labels.includes("billing") || t.team_labels.includes("account")) {
      external_ticket_ids.jira = `SUP-${100 + Math.floor(Math.random() * 900)}`;
    }

    return {
      content: t.content,
      status: "routed" as const,
      sentiment: t.sentiment,
      team_labels: t.team_labels,
      actionable: t.actionable,
      external_ticket_ids,
      created_at: new Date(now - t.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  const { error: insertError } = await supabaseAdmin.from("tickets").insert(rows);
  if (insertError) throw insertError;

  return { inserted: rows.length };
}
