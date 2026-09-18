import type { Sentiment, Team } from "./types";

interface SeedTicket {
  content: string;
  sentiment: Sentiment;
  team_labels: Team[];
  actionable: boolean;
  daysAgo: number;
}

// Curated sample tickets forming realistic recurring clusters, spread over
// the trailing 7 days, so the reporting pipeline (sentiment aggregation +
// root-cause clustering) has real rows to work over instead of fake JSON.
export const SEED_TICKETS: SeedTicket[] = [
  // Checkout fails on mobile Safari (engineering, negative) — recurring
  { content: "Checkout freezes on the payment step every time I use Safari on my iPhone.", sentiment: "negative", team_labels: ["engineering"], actionable: true, daysAgo: 6 },
  { content: "Can't complete checkout on mobile Safari — the page just spins forever after I hit pay.", sentiment: "negative", team_labels: ["engineering"], actionable: true, daysAgo: 5 },
  { content: "Tried checking out three times on my iPhone, Safari keeps crashing at the payment form.", sentiment: "negative", team_labels: ["engineering"], actionable: true, daysAgo: 4 },
  { content: "Mobile checkout is broken for me — using Safari on iOS 18, payment button does nothing.", sentiment: "negative", team_labels: ["engineering"], actionable: true, daysAgo: 2 },
  { content: "Same issue again, checkout hangs on mobile Safari. Please fix, I keep abandoning my cart.", sentiment: "negative", team_labels: ["engineering"], actionable: true, daysAgo: 1 },

  // Duplicate subscription charge / refund requests (billing, negative) — recurring, never engineering
  { content: "I was charged twice for my monthly subscription this cycle, please refund the duplicate.", sentiment: "negative", team_labels: ["billing"], actionable: false, daysAgo: 6 },
  { content: "My card shows two identical charges from you this week. The app also glitched right after — is that related? Either way I need a refund.", sentiment: "negative", team_labels: ["billing"], actionable: false, daysAgo: 5 },
  { content: "Double billed again for the second month in a row. This is frustrating, please fix and refund.", sentiment: "negative", team_labels: ["billing"], actionable: false, daysAgo: 3 },
  { content: "Got charged twice for my annual plan renewal. Need the extra charge reversed ASAP.", sentiment: "negative", team_labels: ["billing"], actionable: false, daysAgo: 1 },
  { content: "Duplicate charge on my statement again this month — third time this has happened.", sentiment: "negative", team_labels: ["billing"], actionable: false, daysAgo: 0 },

  // Confusion about refund timeline (billing/account, neutral)
  { content: "I requested a refund last week, just checking on the timeline for when it'll land.", sentiment: "neutral", team_labels: ["billing"], actionable: false, daysAgo: 5 },
  { content: "How long do refunds usually take? Submitted mine 10 days ago and haven't heard back.", sentiment: "neutral", team_labels: ["account"], actionable: false, daysAgo: 3 },
  { content: "Following up on my refund request — no update in my account yet, is this normal?", sentiment: "neutral", team_labels: ["billing", "account"], actionable: false, daysAgo: 1 },

  // Login page 500 error (engineering, negative)
  { content: "Getting a 500 error every time I try to log in from the web app since this morning.", sentiment: "negative", team_labels: ["engineering"], actionable: true, daysAgo: 4 },
  { content: "Login page is throwing a server error, can't access my account at all.", sentiment: "negative", team_labels: ["engineering"], actionable: true, daysAgo: 3 },
  { content: "Site keeps giving me a 500 internal server error on the sign-in page.", sentiment: "negative", team_labels: ["engineering"], actionable: true, daysAgo: 2 },

  // Dark mode requests (product, neutral)
  { content: "Would love to see a dark mode option in the app, the white screen is rough at night.", sentiment: "neutral", team_labels: ["product"], actionable: false, daysAgo: 6 },
  { content: "Any plans to add dark mode? Been wanting this for a while.", sentiment: "neutral", team_labels: ["product"], actionable: false, daysAgo: 4 },
  { content: "Please add a dark theme, would use this app so much more comfortably at night.", sentiment: "neutral", team_labels: ["product"], actionable: false, daysAgo: 2 },
  { content: "Dark mode when? Everyone I know is asking for it too.", sentiment: "neutral", team_labels: ["product"], actionable: false, daysAgo: 0 },

  // Praise for onboarding flow (product, positive)
  { content: "Just signed up and the onboarding flow was seriously smooth, really well designed.", sentiment: "positive", team_labels: ["product"], actionable: false, daysAgo: 5 },
  { content: "Loved how easy it was to get started — the new onboarding is a huge improvement.", sentiment: "positive", team_labels: ["product"], actionable: false, daysAgo: 3 },
  { content: "Whoever redesigned the onboarding did an amazing job, took me two minutes to get set up.", sentiment: "positive", team_labels: ["product"], actionable: false, daysAgo: 1 },

  // Great support experience (support, positive)
  { content: "Just wanted to say your support team resolved my issue in minutes, fantastic service.", sentiment: "positive", team_labels: ["support"], actionable: false, daysAgo: 4 },
  { content: "Shoutout to the support rep who helped me yesterday, super patient and thorough.", sentiment: "positive", team_labels: ["support"], actionable: false, daysAgo: 2 },
];
