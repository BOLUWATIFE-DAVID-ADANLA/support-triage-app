-- Support Ticket Intelligence Pipeline — initial schema
-- RLS is enabled in 0002_enable_rls.sql.

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  status text not null default 'pending', -- pending, classified, routed
  sentiment text,
  team_labels text[],
  actionable boolean,
  external_ticket_ids jsonb, -- { "jira": "...", "linear": "..." }
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  period_start timestamptz,
  period_end timestamptz,
  sentiment_summary jsonb,
  root_cause_clusters jsonb,
  created_at timestamptz not null default now()
);

create index if not exists tickets_status_idx on tickets (status);
create index if not exists tickets_created_at_idx on tickets (created_at);
create index if not exists reports_created_at_idx on reports (created_at desc);
