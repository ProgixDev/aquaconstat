-- 0005_dossiers — real devis dossiers, persisted at checkout (spec 006).
--
-- Photos are NEVER stored (RGPD, client 2026-07-21): no photo columns, no bucket.
-- They are attached to the operator e-mail only. This table holds the dossier's
-- TEXT so the back-office can track it and Nino can flip its status.
--
-- Security: the 0001 baseline event trigger auto-enables RLS on this new table
-- and anon/authenticated hold no grants, so the Data API cannot reach it. Only
-- the server-side SERVICE-ROLE client touches it. Payment truth (`paid_at`) is
-- set solely by the signature-verified Stripe webhook (or the demo confirm in
-- simulation) — never from a browser redirect.

create table public.dossiers (
  id                uuid primary key default gen_random_uuid(),
  reference         text not null unique,                 -- AC-2026-NNNN, server-generated
  -- Queryable columns for the admin list + SLA countdown:
  nom               text not null default '',
  ville             text not null default '',
  email             text not null default '',
  statut            text not null default 'En attente'
                      check (statut in ('En attente', 'Devis envoyé')),
  created_at        timestamptz not null default now(),
  paid_at           timestamptz,                          -- set by webhook / demo confirm only
  devis_envoye_at   timestamptz,                          -- stamped when statut → Devis envoyé
  stripe_session_id text,                                 -- correlation + webhook idempotency
  -- Full FunnelData snapshot (TEXT only — never any image data) for the detail view:
  data              jsonb not null default '{}'::jsonb
);

comment on table public.dossiers is
  'Devis dossiers (pending or paid). No photos (e-mailed only, RGPD). RLS deny-all; service-role only.';

create index dossiers_paid_at_idx    on public.dossiers (paid_at desc);
create index dossiers_statut_idx     on public.dossiers (statut);
create index dossiers_created_at_idx on public.dossiers (created_at desc);

-- Belt-and-suspenders: the 0001 trigger already turned RLS on. Assert it, and add
-- no policies — anon/authenticated therefore get nothing; the service role bypasses
-- RLS for the server-side store.
alter table public.dossiers enable row level security;
