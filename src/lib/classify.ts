import Anthropic from "@anthropic-ai/sdk";
import type { ClassificationResult, Sentiment } from "./types";

const TEAM_LABELS = [
  "engineering",
  "billing",
  "account",
  "product",
  "support",
] as const;

const CLASSIFY_TOOL_NAME = "record_classification";

const SYSTEM_PROMPT = `You are the triage classifier for a customer support pipeline. Given a single support ticket's content, return:

1. sentiment: the customer's emotional tone — "positive", "neutral", or "negative".
2. team_labels: the team(s) that should receive this ticket. Choose one or more from: ${TEAM_LABELS.join(", ")}. A ticket can span multiple teams (e.g. a billing dispute that also references a broken feature).
3. actionable: whether this ticket represents something engineering should act on as a bug or technical issue.

Actionability gate — apply this rule strictly: tickets that are fundamentally about claims, refunds, billing disputes, or account/subscription issues are NEVER actionable by engineering, even if the customer describes symptoms that sound like a bug (e.g. "the app charged me twice and crashed"). In that case route to billing/account and set actionable to false. Only set actionable to true when the core issue is a genuine technical defect engineering can fix — and in that case "engineering" must be included in team_labels.`;

export async function classifyTicket(
  content: string,
): Promise<ClassificationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
    tools: [
      {
        name: CLASSIFY_TOOL_NAME,
        description: "Record the classification result for this ticket.",
        input_schema: {
          type: "object",
          properties: {
            sentiment: {
              type: "string",
              enum: ["positive", "neutral", "negative"],
            },
            team_labels: {
              type: "array",
              items: { type: "string", enum: TEAM_LABELS as unknown as string[] },
              minItems: 1,
            },
            actionable: { type: "boolean" },
          },
          required: ["sentiment", "team_labels", "actionable"],
        },
      },
    ],
    tool_choice: { type: "tool", name: CLASSIFY_TOOL_NAME },
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );
  if (!toolUse) {
    throw new Error("Classification model did not return a tool call");
  }

  const result = toolUse.input as {
    sentiment: Sentiment;
    team_labels: string[];
    actionable: boolean;
  };

  // Belt-and-suspenders enforcement of the actionability gate in code,
  // in case the model slips despite the prompt instruction.
  const isClaimsOrBilling = result.team_labels.some(
    (label) => label === "billing" || label === "account",
  );
  if (isClaimsOrBilling && !result.team_labels.includes("engineering")) {
    result.actionable = false;
  }

  return result;
}
