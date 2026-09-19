import type { Team } from "./types";

export const TEAM_COLOR_VAR: Record<Team, string> = {
  engineering: "var(--cat-engineering)",
  billing: "var(--cat-billing)",
  account: "var(--cat-account)",
  product: "var(--cat-product)",
  support: "var(--cat-support)",
};

export const TEAM_LABEL: Record<Team, string> = {
  engineering: "Engineering",
  billing: "Billing",
  account: "Account",
  product: "Product",
  support: "Support",
};
