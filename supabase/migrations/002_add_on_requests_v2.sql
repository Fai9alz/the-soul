-- ─────────────────────────────────────────────────────────────────────────────
-- The Soul — Add-ons request enhancements
-- Run this once in the Supabase SQL editor (after 001_add_ons.sql).
-- Adds customer/unit/total/status columns + admin update policy.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Add columns (idempotent) ─────────────────────────────────────────────────

alter table public.add_on_requests
  add column if not exists customer_name   text   not null default '',
  add column if not exists unit_residence  text   not null default '',
  add column if not exists total_price     text   not null default '',
  add column if not exists status          text   not null default 'New';

-- Enforce allowed status values
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'add_on_requests_status_check'
  ) then
    alter table public.add_on_requests
      add constraint add_on_requests_status_check
      check (status in ('New', 'Contacted', 'Completed'));
  end if;
end $$;

-- Index for admin filters
create index if not exists add_on_requests_status_idx        on public.add_on_requests (status);
create index if not exists add_on_requests_unit_idx          on public.add_on_requests (unit_residence);
create index if not exists add_on_requests_customer_idx      on public.add_on_requests (customer_name);
create index if not exists add_on_requests_created_at_idx    on public.add_on_requests (created_at desc);

-- ── RLS: allow authenticated admins to update + delete ──────────────────────

drop policy if exists "auth update add_on_requests" on public.add_on_requests;
create policy "auth update add_on_requests" on public.add_on_requests
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "auth delete add_on_requests" on public.add_on_requests;
create policy "auth delete add_on_requests" on public.add_on_requests
  for delete
  using (auth.role() = 'authenticated');
