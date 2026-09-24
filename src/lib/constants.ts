// Ticket content is untrusted, unauthenticated user input (see
// /api/submit-ticket and /api/classify) — cap it so a single request can't
// balloon Gemini cost/latency or bloat the `tickets` table.
export const MAX_TICKET_CONTENT_LENGTH = 5000;

// clusterRootCauses sends every ticket's full content to Gemini in one call.
// Left unbounded, that call's input grows with total ticket volume and will
// eventually blow past the model's context/output budget. Sentiment/team
// stats still cover every ticket in the period — only clustering is capped,
// to the most recent N.
export const MAX_CLUSTER_TICKETS = 300;
