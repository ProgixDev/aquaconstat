"use client";

import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { useFunnelStore } from "../provider";
import type { PieceKey, SurfacePart, Taille } from "../types";
import { ChoicePill } from "./choice-pill";
import { ContinueCta } from "./continue-cta";
import { SubPanel } from "./sub-panel";
import { StepMeta } from "./step-shell";
import { TextField } from "./text-field";

export const pieceNames: Record<PieceKey, string> = {
  salon: "Salon",
  chambre: "Chambre",
  cuisine: "Cuisine",
  sdb: "Salle de bain",
  couloirWc: "Couloir/WC",
  // For the pro audience — syndics and gérants d’immeubles (client, 2026-07-16).
  partiesCommunes: "Parties communes (Hall, cage d’escalier…)",
};

const partLabels: [SurfacePart, string][] = [
  ["plaf", "Le plafond"],
  ["murs", "Les murs"],
  ["sol", "Le sol"],
];

const tailleOptions: [Exclude<Taille, "">, string][] = [
  ["petite", "Petite (moins de 10 m²)"],
  ["moyenne", "Moyenne (10 à 20 m²)"],
  ["grande", "Grande (plus de 20 m²)"],
];

/**
 * Étape 2 « Ultra-Light » (spec 003, R2R 2026-07-16) — only what changes the
 * price of the work: when it happened, which rooms, what to redo in each, and
 * roughly how big. The constat-amiable interrogation (leak search, cause,
 * origin, liable third party) is gone: the artisan is redoing paint and floors,
 * not fixing the leak.
 */
export function QuestionnaireForm() {
  const data = useFunnelStore((s) => s.data);
  const setField = useFunnelStore((s) => s.setField);
  const togglePiece = useFunnelStore((s) => s.togglePiece);
  const toggleSurfacePart = useFunnelStore((s) => s.toggleSurfacePart);
  const setRoomTaille = useFunnelStore((s) => s.setRoomTaille);

  const selected = (Object.keys(pieceNames) as PieceKey[]).filter((key) => data.pieces[key]);

  return (
    <>
      <h1 className="font-display text-2xl font-bold md:text-3xl">Décrivez votre dégât des eaux</h1>
      <StepMeta step={2} />
      <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed md:text-base">
        Vos réponses permettent au professionnel d’établir le devis sans se déplacer. Des valeurs
        approximatives suffisent.
      </p>

      <section className="mt-9">
        <h2 className="font-display text-lg font-bold">Les infos de base</h2>
        <div className="mt-4">
          <TextField
            label="Date du sinistre (approximative)"
            type="date"
            value={data.dateSinistre}
            onChange={(v) => setField("dateSinistre", v)}
          />
        </div>
      </section>

      <section className="mt-9">
        <h2 className="font-display text-lg font-bold">Les pièces touchées</h2>
        <div className="mt-4">
          <div className="text-sm font-semibold">Cochez la ou les pièces endommagées</div>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {(Object.keys(pieceNames) as PieceKey[]).map((key) => (
              <ChoicePill
                key={key}
                square
                selected={data.pieces[key]}
                onClick={() => togglePiece(key)}
              >
                {pieceNames[key]}
              </ChoicePill>
            ))}
          </div>
        </div>

        {/* One block per selected pièce — nothing to answer for rooms you skip. */}
        {selected.length > 0 && (
          <div className="mt-5 flex flex-col gap-3">
            {selected.map((key) => {
              const room = data.surfaces[key];
              return (
                <SubPanel key={key}>
                  <div className="flex items-center gap-2.5">
                    <DropletGlyph size="md" />
                    <span className="text-base font-semibold">{pieceNames[key]}</span>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-semibold">Que faut-il refaire ?</div>
                    <div className="mt-2.5 flex flex-wrap gap-2.5">
                      {partLabels.map(([part, label]) => (
                        <ChoicePill
                          key={part}
                          square
                          selected={Boolean(room?.[part])}
                          onClick={() => toggleSurfacePart(key, part)}
                        >
                          {label}
                        </ChoicePill>
                      ))}
                    </div>
                  </div>

                  <div
                    className="mt-4"
                    role="radiogroup"
                    aria-label={`Taille — ${pieceNames[key]}`}
                  >
                    <div className="text-sm font-semibold">Taille de la pièce (approximative)</div>
                    <div className="mt-2.5 flex flex-wrap gap-2.5">
                      {tailleOptions.map(([value, label]) => (
                        <ChoicePill
                          key={value}
                          selected={room?.taille === value}
                          onClick={() => setRoomTaille(key, value)}
                        >
                          {label}
                        </ChoicePill>
                      ))}
                    </div>
                  </div>
                </SubPanel>
              );
            })}
          </div>
        )}
      </section>

      <ContinueCta href="/dossier/photos">Continuer vers les photos</ContinueCta>
    </>
  );
}
