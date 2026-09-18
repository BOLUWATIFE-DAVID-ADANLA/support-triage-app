import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { classifyTicket } from "@/lib/classify";

// Demo-mode route: inserts the ticket (same as the production path, which
// picks it up via the Supabase → n8n webhook) AND classifies it synchronously
// so the page can show instant feedback instead of waiting on the async
// pipeline. The insert is what matters for real routing; the inline
// classification here is just a demo convenience and doesn't dispatch to
// Jira/Linear/Slack — that only happens in the n8n workflow.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase is not configured (SUPABASE_SERVICE_ROLE_KEY missing)" },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const content = body?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "content (string) is required" },
      { status: 400 },
    );
  }

  const { data: ticket, error: insertError } = await supabaseAdmin
    .from("tickets")
    .insert({ content, status: "pending" })
    .select()
    .single();

  if (insertError || !ticket) {
    console.error("insert ticket error", insertError);
    return NextResponse.json(
      { error: "failed to save ticket" },
      { status: 500 },
    );
  }

  try {
    const classification = await classifyTicket(content);

    const { error: updateError } = await supabaseAdmin
      .from("tickets")
      .update({
        status: "classified",
        sentiment: classification.sentiment,
        team_labels: classification.team_labels,
        actionable: classification.actionable,
      })
      .eq("id", ticket.id);

    if (updateError) {
      console.error("update ticket error", updateError);
    }

    return NextResponse.json({
      id: ticket.id,
      ...classification,
    });
  } catch (err) {
    console.error("classify error", err);
    // Ticket is saved either way; classification just failed inline.
    return NextResponse.json({
      id: ticket.id,
      error: "classification failed, ticket saved as pending",
    });
  }
}
