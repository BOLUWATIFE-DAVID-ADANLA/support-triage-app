import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { withRetry } from "./withRetry";
import type { ClassificationResult, Sentiment } from "./types";

export const TEAM_LABELS = [
  "engineering",
  "billing",
  "account",
  "product",
  "support",
] as const;

const SYSTEM_PROMPT = `You are the triage classifier for a customer support pipeline. Given a single support ticket's content, return:

1. sentiment: the customer's emotional tone — "positive", "neutral", or "negative".
2. team_labels: the team(s) that should receive this ticket. Choose one or more from: ${TEAM_LABELS.join(", ")}. A ticket can span multiple teams (e.g. a billing dispute that also references a broken feature).
3. actionable: whether this ticket represents something engineering should act on as a bug or technical issue.

Actionability gate — apply this rule strictly: tickets that are fundamentally about claims, refunds, billing disputes, or account/subscription issues are NEVER actionable by engineering, even if the customer describes symptoms that sound like a bug (e.g. "the app charged me twice and crashed"). In that case route to billing/account and set actionable to false. Only set actionable to true when the core issue is a genuine technical defect engineering can fix — and in that case "engineering" must be included in team_labels.`;

export async function classifyTicket(
  content: string,
): Promise<ClassificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          sentiment: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["positive", "neutral", "negative"],
          },
          team_labels: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.STRING,
              format: "enum",
              enum: [...TEAM_LABELS],
            },
          },
          actionable: { type: SchemaType.BOOLEAN },
        },
        required: ["sentiment", "team_labels", "actionable"],
      },
    },
  });

  const result = await withRetry(() =>
    model.generateContent(content, { timeout: 20_000 }),
  );
  const parsed = JSON.parse(result.response.text()) as {
    sentiment: Sentiment;
    team_labels: string[];
    actionable: boolean;
  };

  // Belt-and-suspenders enforcement of the actionability gate in code,
  // in case the model slips despite the prompt instruction.
  const isClaimsOrBilling = parsed.team_labels.some(
    (label) => label === "billing" || label === "account",
  );
  if (isClaimsOrBilling && !parsed.team_labels.includes("engineering")) {
    parsed.actionable = false;
  }

  return parsed;
}
