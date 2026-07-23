-- 0006_dossier_photos — store dossier photos in a PRIVATE bucket (spec 006,
-- client 2026-07-22 on the Pro plan; reverses the brief 2026-07-21 e-mail-only
-- call in 0005's comment).
--
-- Photos ARE the artisan's quoting material, so losing them on a closed tab is
-- unacceptable. They are uploaded at checkout to a private bucket keyed by
-- dossier reference; the admin reaches them only through short-lived SIGNED URLs
-- generated server-side by the service role. The bucket is NOT public and gets
-- no storage RLS policies — anon/authenticated are denied by default, the
-- service role bypasses RLS. A retention job (added later) sweeps old objects.

-- Photo metadata on the dossier row: [{ path, name, takenAt }]. The bytes live
-- in Storage; this only records where + when-shot. Never any base64/bytes here.
alter table public.dossiers
  add column if not exists photos jsonb not null default '[]'::jsonb;

-- Private bucket. 20 MB/object cap, images only — a second server-side guard on
-- top of the funnel's own client-side downscale.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dossier-photos',
  'dossier-photos',
  false,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp']
)
-- do UPDATE, not do NOTHING: if the bucket already existed (e.g. created from
-- the dashboard, where the default toggle is PUBLIC) a `do nothing` would leave
-- every home photo world-readable while this migration reported success.
-- Privacy has to be re-asserted, not merely requested once.
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
