import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  DossierData,
  DossierMatch,
  DossierPhoto,
  DossierRecord,
  DossierStatut,
  DossierStore,
  NewDossier,
} from "./types";

/**
 * Supabase dossier store — the LIVE adapter (used when SUPABASE_SERVICE_ROLE_KEY
 * is set). Every call goes through the SERVICE-ROLE client, which bypasses RLS;
 * the `dossiers` table has RLS on and no policies, so nothing else can reach it
 * (migration 0005 + the 0001 baseline). No photo data is ever read or written.
 */

type Row = {
  reference: string;
  nom: string;
  ville: string;
  email: string;
  statut: DossierStatut;
  created_at: string;
  paid_at: string | null;
  devis_envoye_at: string | null;
  stripe_session_id: string | null;
  data: DossierData;
  photos: DossierPhoto[] | null;
};

function toRecord(r: Row): DossierRecord {
  return {
    reference: r.reference,
    nom: r.nom,
    ville: r.ville,
    email: r.email,
    statut: r.statut,
    createdAt: r.created_at,
    paidAt: r.paid_at,
    devisEnvoyeAt: r.devis_envoye_at,
    stripeSessionId: r.stripe_session_id,
    data: r.data,
    photos: r.photos ?? [],
  };
}

export const supabaseStore: DossierStore = {
  async create(input: NewDossier) {
    const d = input.data;
    const supabase = createAdminClient();
    // Plain insert, not upsert: a duplicate reference must FAIL so the caller
    // retries with a new one rather than two dossiers colliding on one ref.
    const { error } = await supabase.from("dossiers").insert({
      reference: input.reference,
      nom: d.nom,
      ville: d.ville,
      email: d.email,
      statut: "En attente",
      stripe_session_id: input.stripeSessionId ?? null,
      data: d,
      photos: input.photos ?? [],
    });
    if (error) throw new Error(`dossiers.create failed: ${error.message}`);
  },

  async attachPhotos(reference: string, photos: DossierPhoto[]) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("dossiers").update({ photos }).eq("reference", reference);
    if (error) throw new Error(`dossiers.attachPhotos failed: ${error.message}`);
  },

  async markPaid(match: DossierMatch, paidAtISO: string) {
    const supabase = createAdminClient();
    // Guard on paid_at IS NULL so a retried webhook can't re-pay (or re-e-mail):
    // 0 rows updated ⇒ already paid or unknown ⇒ null.
    let query = supabase.from("dossiers").update({ paid_at: paidAtISO }).is("paid_at", null);
    if (match.reference) query = query.eq("reference", match.reference);
    else if (match.sessionId) query = query.eq("stripe_session_id", match.sessionId);
    else return null;
    const { data, error } = await query.select().maybeSingle();
    if (error) throw new Error(`dossiers.markPaid failed: ${error.message}`);
    return data ? toRecord(data as Row) : null;
  },

  async list() {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`dossiers.list failed: ${error.message}`);
    return (data as Row[]).map(toRecord);
  },

  async get(reference: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();
    if (error) throw new Error(`dossiers.get failed: ${error.message}`);
    return data ? toRecord(data as Row) : null;
  },

  async setStatut(reference: string, statut: DossierStatut, atISO: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .update({ statut, devis_envoye_at: statut === "Devis envoyé" ? atISO : null })
      .eq("reference", reference)
      .select()
      .maybeSingle();
    if (error) throw new Error(`dossiers.setStatut failed: ${error.message}`);
    return data ? toRecord(data as Row) : null;
  },
};
