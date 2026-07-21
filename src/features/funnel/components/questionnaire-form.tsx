"use client";

import { AnimatePresence, listItem, m } from "@/components/motion";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { useFunnelStore } from "../provider";
import type { PieceKey, SurfacePart } from "../types";
import { ChoicePill } from "./choice-pill";
import { ContinueCta } from "./continue-cta";
import { SubPanel } from "./sub-panel";
import { StepMeta } from "./step-shell";
import { TextField } from "./text-field";
import { missingForQuestionnaire } from "../validation";

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

/** Label for the per-part m² field, e.g. « Surface touchée au plafond ». */
const partSurfaceLabels: Record<SurfacePart, string> = {
  plaf: "Surface touchée au plafond",
  murs: "Surface touchée aux murs",
  sol: "Surface touchée au sol",
};

/**
 * Étape 2 « Ultra-Light » (spec 003, R2R 2026-07-16) — only what changes the
 * price of the work: when it happened, which rooms, what to redo in each, and
 * roughly how big. The petite/moyenne/grande bands became a free m² estimate
 * per room (client + FAQ update, 2026-07-18) — a simple numeric field, e.g.
 * « 12 ». The constat-amiable interrogation (leak search, cause, origin,
 * liable third party) is gone: the artisan is redoing paint and floors, not
 * fixing the leak.
 */
export function QuestionnaireForm() {
  const data = useFunnelStore((s) => s.data);
  const setField = useFunnelStore((s) => s.setField);
  const togglePiece = useFunnelStore((s) => s.togglePiece);
  const toggleSurfacePart = useFunnelStore((s) => s.toggleSurfacePart);
  const setPartSurfaceM2 = useFunnelStore((s) => s.setPartSurfaceM2);

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
          {/* Wording aligned with the insurer's official declaration (client,
              2026-07-18) — no longer an « approximate » date. */}
          <TextField
            label="Date du sinistre déclaré à votre assureur"
            type="date"
            hint="Telle qu’indiquée dans votre déclaration."
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

        {/* One block per selected pièce — nothing to answer for rooms you skip.
            Panels spring in when a room is checked and fade out when unchecked
            (empty: hides the container so the margin never lingers). */}
        <div className="mt-5 flex flex-col gap-3 empty:hidden">
          <AnimatePresence initial={false}>
            {selected.map((key) => {
              const room = data.surfaces[key];
              return (
                <m.div
                  key={key}
                  layout
                  initial={listItem.initial}
                  animate={listItem.animate}
                  exit={listItem.exit}
                  transition={listItem.transition}
                >
                  <SubPanel>
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
                            selected={room ? part in room.parts : false}
                            onClick={() => toggleSurfacePart(key, part)}
                          >
                            {label}
                          </ChoicePill>
                        ))}
                      </div>
                    </div>

                    {/* One m² field per checked part (client, 2026-07-21): check
                        « Le plafond » and « Le sol » and you get two fields —
                        surface au plafond, surface au sol. Each springs in with
                        its pill and leaves when the part is unchecked. */}
                    <div className="mt-2 flex flex-col gap-3 empty:mt-0">
                      <AnimatePresence initial={false}>
                        {partLabels
                          .filter(([part]) => room && part in room.parts)
                          .map(([part]) => (
                            <m.div
                              key={part}
                              layout
                              initial={listItem.initial}
                              animate={listItem.animate}
                              exit={listItem.exit}
                              transition={listItem.transition}
                            >
                              <TextField
                                label={`${partSurfaceLabels[part]} (m², approximative)`}
                                inputMode="decimal"
                                placeholder="12"
                                hint="Une estimation suffit — par exemple : 12 m²."
                                value={room?.parts[part] ?? ""}
                                onChange={(v) => setPartSurfaceM2(key, part, v)}
                                className="max-w-xs"
                              />
                            </m.div>
                          ))}
                      </AnimatePresence>
                    </div>
                  </SubPanel>
                </m.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      <ContinueCta href="/dossier/photos" missing={missingForQuestionnaire(data)}>
        Continuer vers les photos
      </ContinueCta>
    </>
  );
}
