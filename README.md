# Support Triage

An AI-assisted triage layer for customer support. Customers submit free-text tickets; each one is automatically classified by an LLM (Gemini), routed to the right team, and rolled up into a dashboard that shows what customers are feeling and what keeps going wrong.

## The premise

This project mimics a real-world application of sentiment analysis and the insights it gives upper management and the leads of engineering and product. The front end is a small web app where users submit tickets. Each ticket's text is classified for sentiment, and the department that owns it is worked out from the customer's complaint.

The other half of the workflow isn't visible in this app: it's triggered whenever a ticket is submitted. Once the sentiment is analysed, it creates tasks in the workbenches of the teams that were paged. The dashboard is the management-facing view over the same data.

Support inboxes are noisy. Every ticket needs someone to read it, decide how upset the customer is, figure out which team owns it, and work out whether it's a real bug or a billing question wearing a bug costume. That manual sorting is slow, inconsistent, and hides the bigger picture: no one sees that twelve "different" tickets are all the same underlying outage.

This project automates that first pass:

1. **Classify each ticket** — sentiment (`positive` / `neutral` / `negative`), the team(s) that should own it (`engineering`, `billing`, `account`, `product`, `support`), and whether it's *actionable* by engineering.
2. **Enforce a strict actionability gate** — tickets that are fundamentally about claims, refunds, billing disputes, or account/subscription issues are never actionable by engineering, even if the customer describes symptoms that sound like a bug ("the app charged me twice and crashed" goes to billing/account, not to an engineer). The rule is in the prompt and re-enforced in code in case the model slips (`src/lib/classify.ts`).
3. **Report on the whole picture** — aggregate sentiment over time, ticket volume per team, and cluster tickets into recurring root causes so repeated problems surface as one issue instead of many.

## How it works

```
 ticket form ──▶ /api/submit-ticket ──▶ Supabase `tickets` (status: pending)
                        │
                        └─▶ Gemini classification ──▶ ticket updated (status: classified)

 dashboard ──▶ /api/reports/generate ──▶ aggregate sentiment + team counts (Supabase)
                                     └─▶ cluster root causes (Gemini) ──▶ Supabase `reports`
```

- **Submission** (`/`) — a form that saves the ticket and returns the classification immediately for instant feedback. The insert is what matters; if inline classification fails or times out, the ticket is still saved as `pending`.
- **Dashboard** (`/dashboard`) — reflects real submissions only (no seeded data). Pick a period (trailing days or all time) and generate a report: sentiment breakdown and trend, tickets per team, and recurring root-cause clusters. Sentiment/team stats come purely from Supabase and always save; root-cause clustering needs Gemini and degrades gracefully if it's flaky or rate-limited.
- **Retries** — Gemini and Supabase calls are wrapped in retry helpers (`withRetry`, `withSupabaseRetry`) to ride out transient failures.

The submit route and report generator are written to mirror an external n8n workflow (Supabase webhook → classify → dispatch to Jira/Linear/Slack, plus a cron reporting job). This app's inline versions are the demo path; dispatching to external tools happens only in that workflow.

## Open question: who gets the work?

Classification tells us *which team* owns a ticket, but not *who* on that team should act on it. Task assignment hasn't been designed yet.

Options for the downstream step, roughly in order of ambition:

1. **Drop the ticket into Linear or Jira** for the affected team. This is the first step and already real progress.
2. **Email the heads of the affected departments.** Likely the better default for now: it puts the ticket in front of a person with the authority to assign it, and sidesteps needing an assignment rule up front.
3. **Automatic assignment to an individual** (rotation, on-call, load-based). Only worth building once the first two show what a good rule looks like.

None of these are implemented in this repo. They belong to the trigger-on-submit workflow described above.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- Tailwind CSS v4
- [Supabase](https://supabase.com) (Postgres) for tickets and reports
- Google Gemini (`gemini-flash-latest`) with structured JSON output for classification and clustering

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project and run the migration in `supabase/migrations/0001_init.sql`.

3. Copy `.env.example` to `.env.local` and fill it in:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   GEMINI_API_KEY=
   ```

4. Start the dev server and open [http://localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

Submit a few tickets on the home page, then visit `/dashboard` to generate a report.

## Project layout

```
src/
  app/
    page.tsx                  ticket submission page
    dashboard/                report dashboard (period picker, stat tiles, team/sentiment/root-cause views)
    api/submit-ticket/        save + classify a ticket
    api/classify/             classify without saving
    api/reports/generate/     build and store a report
  lib/
    classify.ts               Gemini ticket classifier + actionability gate
    report.ts                 report aggregation + root-cause clustering
    withRetry.ts, withSupabaseRetry.ts
    supabase.ts, types.ts, teamColors.ts
supabase/migrations/          database schema
```
