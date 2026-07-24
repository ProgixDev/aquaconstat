#!/usr/bin/env node
/**
 * One-off: purge test dossiers before launch. Mirrors deleteDossier() in
 * src/lib/dossiers/retention.ts — photos go through the Storage API (Supabase
 * REFUSES direct storage.objects deletes, which would orphan the files), then
 * the row is removed. Service-role client, same as the live app.
 *
 * Usage:
 *   node scripts/purge-test-dossiers.mjs           # dry run — lists what would go
 *   node scripts/purge-test-dossiers.mjs --apply   # actually delete everything
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local
 * (never printed). Not part of `pnpm verify`.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "dossier-photos";

function loadEnvLocal() {
  const env = {};
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env.local — fall back to process.env */
  }
  return env;
}

const env = { ...loadEnvLocal(), ...process.env };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const apply = process.argv.includes("--apply");

const missing = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter((k) => !env[k]);
if (missing.length) {
  console.error(`✗ Missing in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: rows, error } = await supabase
  .from("dossiers")
  .select("reference, nom, ville, statut, paid_at")
  .order("created_at", { ascending: false });
if (error) {
  console.error(`✗ Could not list dossiers: ${error.message}`);
  process.exit(1);
}

if (!rows.length) {
  console.log("Nothing to purge — the dossiers table is already empty.");
  process.exit(0);
}

console.log(`${apply ? "PURGING" : "DRY RUN — would purge"} ${rows.length} dossier(s):`);
for (const r of rows) {
  console.log(`  ${r.reference}  ${r.nom} / ${r.ville}  [${r.statut}${r.paid_at ? ", payé" : ""}]`);
}

if (!apply) {
  console.log("\nRe-run with --apply to delete.");
  process.exit(0);
}

let photosRemoved = 0;
let rowsDeleted = 0;
for (const r of rows) {
  // Photos first (Storage API), exactly like deleteDossier → deleteDossierPhotos.
  const { data: objects } = await supabase.storage.from(BUCKET).list(r.reference);
  if (objects?.length) {
    const paths = objects.map((o) => `${r.reference}/${o.name}`);
    const { error: rmErr } = await supabase.storage.from(BUCKET).remove(paths);
    if (rmErr) {
      console.error(
        `✗ ${r.reference}: photo delete failed (${rmErr.message}) — row kept for retry`,
      );
      continue;
    }
    photosRemoved += paths.length;
  }
  const { error: delErr } = await supabase.from("dossiers").delete().eq("reference", r.reference);
  if (delErr) {
    console.error(`✗ ${r.reference}: row delete failed (${delErr.message})`);
    continue;
  }
  rowsDeleted += 1;
  console.log(`✓ ${r.reference} purged`);
}

console.log(`\nDone — ${rowsDeleted} row(s) and ${photosRemoved} photo(s) deleted.`);
