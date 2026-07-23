-- pgTAP RLS tests. Run with: supabase test db
-- Asserts the security invariants — fails loudly if a future migration disables
-- RLS or opens a client path to dossier data.
--
-- Rewritten for spec 006: the notes/profiles/subscriptions scaffolding is gone
-- (AC-10) and `dossiers` is the only application table. Its posture is
-- deny-all — RLS on, NO policies — because nothing but the server-side service
-- role (which bypasses RLS) is ever allowed to touch it.

begin;
select plan(4);

select ok(
  (select bool_and(rowsecurity) from pg_tables where schemaname = 'public'),
  'RLS is enabled on all public tables'
);

select policies_are(
  'public', 'dossiers',
  array[]::text[],
  'dossiers has NO policies — deny-all, service-role only'
);

select ok(
  not has_table_privilege('anon', 'public.dossiers', 'select'),
  'anon cannot select dossiers'
);

select ok(
  not has_table_privilege('authenticated', 'public.dossiers', 'select'),
  'authenticated cannot select dossiers either'
);

select * from finish();
rollback;
