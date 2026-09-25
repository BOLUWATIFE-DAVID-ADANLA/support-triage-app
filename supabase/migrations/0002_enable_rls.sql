-- Lock down tickets/reports to server-only access.
--
-- The app's Supabase anon key is public by design (NEXT_PUBLIC_...), and with
-- RLS off it could be used to read/write/delete both tables directly through
-- Supabase's REST API — bypassing the Next.js app (and the actionability
-- gate) entirely. Every read/write this app performs already goes through
-- `supabaseAdmin` (the service-role client, which bypasses RLS), so enabling
-- RLS with no policies for anon/authenticated fully closes that hole without
-- changing app behavior.
alter table tickets enable row level security;
alter table reports enable row level security;
