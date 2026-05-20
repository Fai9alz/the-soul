-- ─────────────────────────────────────────────────────────────────────────────
-- The Soul — Add-ons system
-- Run this once in the Supabase SQL editor.
-- Creates two tables (add_ons, add_on_requests), enables RLS, and seeds
-- the initial Add-ons catalogue.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Tables ───────────────────────────────────────────────────────────────────

create table if not exists public.add_ons (
  id            uuid          primary key default gen_random_uuid(),
  section       text          not null,
  title         text          not null,
  description   text          not null default '',
  price         text          not null default '',
  price_type    text          not null default 'free'
                check (price_type in ('free', 'additional_fee', 'at_cost')),
  is_custom     boolean       not null default false,
  is_multi      boolean       not null default false,
  is_enabled    boolean       not null default true,
  section_sort  int           not null default 0,
  sort_order    int           not null default 0,
  created_at    timestamptz   not null default now()
);

create index if not exists add_ons_section_idx     on public.add_ons (section_sort, section);
create index if not exists add_ons_sort_order_idx  on public.add_ons (sort_order);

create table if not exists public.add_on_requests (
  id            uuid          primary key default gen_random_uuid(),
  selections    jsonb         not null,
  custom_notes  jsonb         not null default '{}'::jsonb,
  created_at    timestamptz   not null default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table public.add_ons          enable row level security;
alter table public.add_on_requests  enable row level security;

-- Public can read only enabled add-ons.
drop policy if exists "public read enabled add_ons" on public.add_ons;
create policy "public read enabled add_ons" on public.add_ons
  for select
  using (is_enabled = true);

-- Authenticated admins have full access to add_ons.
drop policy if exists "auth full access add_ons" on public.add_ons;
create policy "auth full access add_ons" on public.add_ons
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Anyone can submit a request.
drop policy if exists "public insert add_on_requests" on public.add_on_requests;
create policy "public insert add_on_requests" on public.add_on_requests
  for insert
  with check (true);

-- Only authenticated admins can read submitted requests.
drop policy if exists "auth read add_on_requests" on public.add_on_requests;
create policy "auth read add_on_requests" on public.add_on_requests
  for select
  using (auth.role() = 'authenticated');

-- ── Seed catalogue (idempotent: skip if rows already exist) ─────────────────

do $$
begin
  if not exists (select 1 from public.add_ons limit 1) then
    insert into public.add_ons (section, section_sort, title, description, price, price_type, is_custom, is_multi, sort_order)
    values
      -- 01 Second Bedroom
      ('Second Bedroom', 1, 'Double bed',                 'Choose the configuration that suits your household.', '', 'free',           false, false, 1),
      ('Second Bedroom', 1, 'Two single beds',            '',                                                    '', 'free',           false, false, 2),

      -- 02 Mattress
      ('Mattress',       2, 'Option 1',                   'Three curated options — two complimentary, one made to your specification.', 'Free', 'free',  false, false, 1),
      ('Mattress',       2, 'Option 2',                   '',                                                    'Free',                  'free',           false, false, 2),
      ('Mattress',       2, 'Option 3 (Custom)',          '',                                                    'Provided at cost',      'at_cost',        true,  false, 3),

      -- 03 Bedding
      ('Bedding',        3, 'Option 1',                   'Linens to match your sleep.',                         'Free',                  'free',           false, false, 1),
      ('Bedding',        3, 'Option 2',                   '',                                                    'Free',                  'free',           false, false, 2),
      ('Bedding',        3, 'Option 3 (Custom)',          '',                                                    'Provided at cost',      'at_cost',        true,  false, 3),

      -- 04 Plants
      ('Plants inside the apartment', 4, 'Natural plants', 'A small piece of green for the space.',              '',                      'free',           false, false, 1),
      ('Plants inside the apartment', 4, 'Artificial plants', '',                                                '',                      'free',           false, false, 2),

      -- 05 Kitchen Appliances
      ('Kitchen Appliances', 5, 'Kettle + toaster set (standard)', 'Pick the daily set that suits your kitchen.', 'Free',                 'free',           false, false, 1),
      ('Kitchen Appliances', 5, 'SMEG kettle + toaster set',       '',                                            'Additional fee',       'additional_fee', false, false, 2),

      -- 06 Coffee Machine (multi)
      ('Coffee Machine', 6, 'Capsules',                   'How would you like your mornings made?',              '',                      'free',           false, true,  1),
      ('Coffee Machine', 6, 'Filter',                     '',                                                    '',                      'free',           false, true,  2),
      ('Coffee Machine', 6, 'X Bloom machine',            '',                                                    'Additional fee',        'additional_fee', false, true,  3),
      ('Coffee Machine', 6, 'Custom option',              '',                                                    'Additional fee',        'additional_fee', true,  true,  4),

      -- 07 Kitchen Add-ons (multi)
      ('Kitchen Add-ons', 7, 'Blender',                   'Small appliances, on request.',                       '',                      'free',           false, true,  1),
      ('Kitchen Add-ons', 7, 'Air fryer',                 '',                                                    '',                      'free',           false, true,  2),
      ('Kitchen Add-ons', 7, 'Extra toaster',             '',                                                    '',                      'free',           false, true,  3),

      -- 08 General Add-ons (multi)
      ('General Add-ons', 8, 'Weekly cleaning',           'Lifestyle services and devices for the residence.',   '8,900',                 'additional_fee', false, true,  1),
      ('General Add-ons', 8, 'Apple TV+ / Shahid subscription', '',                                              '',                      'additional_fee', false, true,  2),
      ('General Add-ons', 8, 'PlayStation device',        '',                                                    '',                      'additional_fee', false, true,  3),
      ('General Add-ons', 8, 'Amazon sound system',       '',                                                    '',                      'additional_fee', false, true,  4);
  end if;
end $$;
