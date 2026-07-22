import "server-only";
import { env } from "@/core/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteDossierPhotos } from "./photos";

/**
 * RGPD retention (windows confirmed by the client, 2026-07-22): a PAID dossier
 * is kept 12 months, a NEVER-PAID one 7 days. Storing photos of people's homes
 * carries the duty to stop storing them — this is that duty, automated.
 *
 * Why this lives in application code and not in a pg_cron SQL job: Supabase
 * REFUSES direct deletes from `storage.objects` ("Direct deletion from storage
 * tables is not allowed. Use the Storage API instead."), precisely to avoid
 * orphaned files. So the sweep has to go through the Storage API, which means
 * server code. Schedule it by POSTing to /api/retention (see that route).
 *
 * Order matters: photos are deleted BEFORE the row, because the row is what
 * tells us which objects belong to the dossier. If photo deletion fails the row
 * survives and the next run retries — we never orphan bytes we can't find again.
 */

export const PAID_RETENTION_DAYS = 365;
export const UNPAID_RETENTION_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export type PurgeResult = { purged: number; references: string[] };

/** Deletes one dossier and its photos — the « delete my data » path (RGPD art. 17). */
export async function deleteDossier(reference: string): Promise<void> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return;
  await deleteDossierPhotos(reference);
  const supabase = createAdminClient();
  const { error } = await supabase.from("dossiers").delete().eq("reference", reference);
  if (error) throw new Error(`deleteDossier failed: ${error.message}`);
}

/** Sweeps every dossier past its retention window. Safe to run repeatedly. */
export async function purgeExpiredDossiers(now = Date.now()): Promise<PurgeResult> {
  // Simulation has no database and no bucket — nothing to purge.
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return { purged: 0, references: [] };

  const supabase = createAdminClient();
  const unpaidCutoff = new Date(now - UNPAID_RETENTION_DAYS * DAY_MS).toISOString();
  const paidCutoff = new Date(now - PAID_RETENTION_DAYS * DAY_MS).toISOString();

  // Two plain queries rather than one `or(and(...))` filter string: easier to
  // read, and a typo in PostgREST filter syntax would silently match nothing.
  const [{ data: staleUnpaid, error: e1 }, { data: stalePaid, error: e2 }] = await Promise.all([
    supabase
      .from("dossiers")
      .select("reference")
      .is("paid_at", null)
      .lt("created_at", unpaidCutoff),
    supabase
      .from("dossiers")
      .select("reference")
      .not("paid_at", "is", null)
      .lt("paid_at", paidCutoff),
  ]);
  if (e1 || e2) throw new Error(`purge query failed: ${(e1 ?? e2)!.message}`);

  const references = [...(staleUnpaid ?? []), ...(stalePaid ?? [])].map(
    (r) => (r as { reference: string }).reference,
  );

  for (const reference of references) {
    await deleteDossier(reference);
  }
  return { purged: references.length, references };
}
