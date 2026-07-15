"use client";

import Link from "next/link";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { useFunnelStore } from "../provider";
import type { Etat, EtatKey, InfilKey, Origine, OuiNon, PieceKey } from "../types";
import { ChoiceCard } from "./choice-card";
import { ChoicePill } from "./choice-pill";
import { ContinueCta } from "./continue-cta";
import { SubPanel } from "./sub-panel";
import { TextField } from "./text-field";

const ouiNon: [OuiNon, string][] = [
  ["oui", "Oui"],
  ["non", "Non"],
];

const origineOptions: [Origine, string][] = [
  ["moi", "Chez moi"],
  ["voisin", "Chez un voisin"],
  ["communes", "Dans les parties communes"],
  ["ailleurs", "Ailleurs"],
];

const infilOptions: [InfilKey, string][] = [
  ["toiture", "Toiture"],
  ["terrasse", "Terrasse"],
  ["facade", "Façade"],
  ["fenetre", "Fenêtre ou porte-fenêtre"],
  ["joint", "Joint d’étanchéité"],
];

export const pieceNames: Record<PieceKey, string> = {
  sdb: "Salle de bain",
  cuisine: "Cuisine",
  salon: "Salon",
  chambre: "Chambre",
  couloir: "Couloir",
  wc: "WC",
  autre: "Autre pièce",
};

const etatRows: [EtatKey, string][] = [
  ["peintures", "Peintures"],
  ["revetements", "Revêtements muraux"],
  ["plinthes", "Plinthes"],
  ["parquet", "Parquet ou carrelage"],
];

const etatOptions: [Etat, string][] = [
  ["intact", "Intact"],
  ["abime", "Abîmé"],
  ["refaire", "À refaire"],
];

function SectionHeading({ letter, children }: { letter: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-secondary text-secondary-foreground flex size-7 flex-none items-center justify-center rounded-sm text-sm font-semibold">
        {letter}
      </span>
      <h2 className="font-display text-lg font-bold">{children}</h2>
    </div>
  );
}

/** Étape 2 — le sinistre (A), surfaces endommagées (B), état des éléments (C). */
export function QuestionnaireForm() {
  const data = useFunnelStore((s) => s.data);
  const setField = useFunnelStore((s) => s.setField);
  const toggleCause = useFunnelStore((s) => s.toggleCause);
  const toggleInfiltration = useFunnelStore((s) => s.toggleInfiltration);
  const togglePiece = useFunnelStore((s) => s.togglePiece);
  const toggleSurfacePart = useFunnelStore((s) => s.toggleSurfacePart);
  const setSurfaceDim = useFunnelStore((s) => s.setSurfaceDim);
  const setEtat = useFunnelStore((s) => s.setEtat);

  const selectedPieces = (Object.keys(pieceNames) as PieceKey[]).filter((k) => data.pieces[k]);

  return (
    <>
      <Link href="/dossier" className="text-muted-foreground hover:text-foreground text-sm">
        ← Retour à l’étape précédente
      </Link>
      <h1 className="font-display mt-4.5 text-3xl font-bold md:text-[34px]">
        Décrivez votre dégât des eaux
      </h1>
      <p className="text-steel mt-3.5 text-base leading-relaxed">
        Vos réponses permettent au professionnel d’établir le devis sans se déplacer. Des valeurs
        approximatives suffisent.
      </p>

      <section className="mt-10">
        <SectionHeading letter="A">Le sinistre</SectionHeading>
        <div className="mt-5.5 flex flex-col gap-5.5">
          <TextField
            label="Date du dégât des eaux"
            type="date"
            value={data.dateSinistre}
            onChange={(v) => setField("dateSinistre", v)}
            hint="Ou une date approximative."
            className="max-w-72"
          />
          <div role="radiogroup" aria-label="Recherche de fuite effectuée">
            <div className="text-sm font-semibold">
              Une recherche de fuite a-t-elle été effectuée par un artisan ou une entreprise ?
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {(
                [
                  ["non", "Non"],
                  ["oui", "Oui"],
                ] as [OuiNon, string][]
              ).map(([value, label]) => (
                <ChoicePill
                  key={value}
                  selected={data.rechercheFuite === value}
                  onClick={() => setField("rechercheFuite", value)}
                >
                  {label}
                </ChoicePill>
              ))}
            </div>
            {data.rechercheFuite === "oui" && (
              <TextField
                label="Par qui ?"
                value={data.rechercheFuitePar}
                onChange={(v) => setField("rechercheFuitePar", v)}
                placeholder="Nom de l’artisan ou de l’entreprise"
                className="mt-3"
              />
            )}
          </div>
          <div className="grid gap-4.5 sm:grid-cols-2">
            <div role="radiogroup" aria-label="Cause identifiée">
              <div className="text-sm font-semibold">La cause est-elle identifiée ?</div>
              <div className="mt-2.5 flex gap-2.5">
                {ouiNon.map(([value, label]) => (
                  <ChoicePill
                    key={value}
                    selected={data.causeIdentifiee === value}
                    onClick={() => setField("causeIdentifiee", value)}
                  >
                    {label}
                  </ChoicePill>
                ))}
              </div>
            </div>
            <div role="radiogroup" aria-label="Cause réparée">
              <div className="text-sm font-semibold">La cause est-elle réparée ?</div>
              <div className="mt-2.5 flex gap-2.5">
                {ouiNon.map(([value, label]) => (
                  <ChoicePill
                    key={value}
                    selected={data.causeReparee === value}
                    onClick={() => setField("causeReparee", value)}
                  >
                    {label}
                  </ChoicePill>
                ))}
              </div>
            </div>
          </div>
          <div role="radiogroup" aria-label="Origine du dégât des eaux">
            <div className="text-sm font-semibold">L’origine du dégât des eaux est située :</div>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              {origineOptions.map(([value, label]) => (
                <ChoiceCard
                  key={value}
                  selected={data.origine === value}
                  onClick={() => setField("origine", value)}
                >
                  {label}
                </ChoiceCard>
              ))}
            </div>
            {data.origine === "ailleurs" && (
              <TextField
                label="Précisez"
                value={data.originePrecision}
                onChange={(v) => setField("originePrecision", v)}
                placeholder="Où se situe l’origine ?"
                className="mt-3"
              />
            )}
          </div>

          <div>
            <div className="text-sm font-semibold">
              Il s’agit de : <span className="text-hint font-normal">(cochez la ou les cases)</span>
            </div>
            <div className="mt-2.5 flex flex-col gap-2.5">
              <ChoiceCard
                checkbox
                selected={data.causes.canal}
                onClick={() => toggleCause("canal")}
              >
                Fuite sur canalisation
              </ChoiceCard>
              {data.causes.canal && (
                <SubPanel indent className="flex flex-col gap-3.5">
                  <div role="radiogroup" aria-label="Canalisation">
                    <div className="text-steel text-xs font-semibold">Canalisation</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(
                        [
                          ["commune", "Commune"],
                          ["privative", "Privative"],
                        ] as ["commune" | "privative", string][]
                      ).map(([value, label]) => (
                        <ChoicePill
                          key={value}
                          dot={false}
                          selected={data.canalType === value}
                          onClick={() => setField("canalType", value)}
                        >
                          {label}
                        </ChoicePill>
                      ))}
                    </div>
                  </div>
                  <div role="radiogroup" aria-label="Type de canalisation">
                    <div className="text-steel text-xs font-semibold">Type</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(
                        [
                          ["alim", "Alimentation"],
                          ["evac", "Évacuation"],
                        ] as ["alim" | "evac", string][]
                      ).map(([value, label]) => (
                        <ChoicePill
                          key={value}
                          dot={false}
                          selected={data.canalFlux === value}
                          onClick={() => setField("canalFlux", value)}
                        >
                          {label}
                        </ChoicePill>
                      ))}
                    </div>
                  </div>
                  <div role="radiogroup" aria-label="Accès à la canalisation">
                    <div className="text-steel text-xs font-semibold">Accès</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(
                        [
                          ["acc", "Accessible"],
                          ["nonacc", "Non accessible"],
                        ] as ["acc" | "nonacc", string][]
                      ).map(([value, label]) => (
                        <ChoicePill
                          key={value}
                          dot={false}
                          selected={data.canalAcces === value}
                          onClick={() => setField("canalAcces", value)}
                        >
                          {label}
                        </ChoicePill>
                      ))}
                    </div>
                  </div>
                </SubPanel>
              )}
              <ChoiceCard
                checkbox
                selected={data.causes.appareil}
                onClick={() => toggleCause("appareil")}
              >
                Fuite ou débordement d’un appareil à effet d’eau{" "}
                <span className="text-muted-foreground">
                  (évier, lavabo, machine à laver, chaudière, cumulus…)
                </span>
              </ChoiceCard>
              <ChoiceCard
                checkbox
                selected={data.causes.cheneaux}
                onClick={() => toggleCause("cheneaux")}
              >
                Fuite ou débordement de chéneaux ou de gouttières
              </ChoiceCard>
              <ChoiceCard
                checkbox
                selected={data.causes.infil}
                onClick={() => toggleCause("infil")}
              >
                Infiltrations
              </ChoiceCard>
              {data.causes.infil && (
                <SubPanel indent>
                  <div className="text-steel text-xs font-semibold">Infiltrations par :</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {infilOptions.map(([value, label]) => (
                      <ChoicePill
                        key={value}
                        dot={false}
                        selected={data.infiltrations[value]}
                        onClick={() => toggleInfiltration(value)}
                      >
                        {label}
                      </ChoicePill>
                    ))}
                  </div>
                </SubPanel>
              )}
              <ChoiceCard checkbox selected={data.causes.gel} onClick={() => toggleCause("gel")}>
                Gel
              </ChoiceCard>
              <ChoiceCard
                checkbox
                selected={data.causes.autre}
                onClick={() => toggleCause("autre")}
              >
                Autre cause
              </ChoiceCard>
              {data.causes.autre && (
                <TextField
                  label="Laquelle ?"
                  value={data.autreCause}
                  onChange={(v) => setField("autreCause", v)}
                  placeholder="Décrivez la cause"
                  className="ml-6"
                />
              )}
            </div>
          </div>

          <div role="radiogroup" aria-label="Tiers à l’origine du sinistre">
            <div className="text-sm font-semibold">
              Un entrepreneur, un installateur ou un vendeur vous paraît-il être à l’origine du
              sinistre ?
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {(
                [
                  ["non", "Non"],
                  ["oui", "Oui"],
                ] as [OuiNon, string][]
              ).map(([value, label]) => (
                <ChoicePill
                  key={value}
                  selected={data.tiersResponsable === value}
                  onClick={() => setField("tiersResponsable", value)}
                >
                  {label}
                </ChoicePill>
              ))}
            </div>
            {data.tiersResponsable === "oui" && (
              <div className="mt-3 flex flex-col gap-3">
                <TextField
                  label="Précisez pourquoi"
                  value={data.tiersPourquoi}
                  onChange={(v) => setField("tiersPourquoi", v)}
                  placeholder="Ex. : intervention récente sur la plomberie"
                />
                <TextField
                  label="Nom et adresse"
                  optional
                  value={data.tiersNom}
                  onChange={(v) => setField("tiersNom", v)}
                />
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-semibold">Pièces concernées</div>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {(Object.keys(pieceNames) as PieceKey[]).map((key) => (
                <ChoicePill
                  key={key}
                  square
                  selected={data.pieces[key]}
                  onClick={() => togglePiece(key)}
                >
                  {key === "autre" ? "Autre" : pieceNames[key]}
                </ChoicePill>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-13">
        <SectionHeading letter="B">Surfaces endommagées</SectionHeading>
        <p className="text-muted-foreground mt-3 text-sm">Une estimation à 20 cm près suffit.</p>
        <div className="mt-5 flex flex-col gap-3.5">
          {selectedPieces.length === 0 && (
            <p className="text-hint text-sm">
              Cochez d’abord les pièces concernées ci-dessus — un bloc apparaîtra pour chacune.
            </p>
          )}
          {selectedPieces.map((key) => {
            const surface = data.surfaces[key];
            return (
              <SubPanel key={key} className="p-5">
                <div className="flex items-center gap-2.5 text-[15px] font-semibold">
                  <DropletGlyph size="md" />
                  {pieceNames[key]}
                </div>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  {(
                    [
                      ["murs", "Murs"],
                      ["plaf", "Plafonds"],
                      ["sols", "Sols"],
                    ] as ["murs" | "plaf" | "sols", string][]
                  ).map(([part, label]) => (
                    <ChoicePill
                      key={part}
                      dot={false}
                      selected={surface?.[part] ?? false}
                      onClick={() => toggleSurfacePart(key, part)}
                    >
                      {label}
                    </ChoicePill>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <label className="text-steel flex flex-col gap-1.5 text-xs font-semibold">
                    Longueur
                    <span className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0,0"
                        value={surface?.longueur ?? ""}
                        onChange={(e) => setSurfaceDim(key, "longueur", e.target.value)}
                        className="border-input bg-paper text-foreground w-22 rounded-sm border px-3 py-2.5 font-sans text-base"
                      />
                      <span className="text-muted-foreground text-sm">m</span>
                    </span>
                  </label>
                  <span className="text-hint pb-3">×</span>
                  <label className="text-steel flex flex-col gap-1.5 text-xs font-semibold">
                    Largeur
                    <span className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0,0"
                        value={surface?.largeur ?? ""}
                        onChange={(e) => setSurfaceDim(key, "largeur", e.target.value)}
                        className="border-input bg-paper text-foreground w-22 rounded-sm border px-3 py-2.5 font-sans text-base"
                      />
                      <span className="text-muted-foreground text-sm">m</span>
                    </span>
                  </label>
                </div>
              </SubPanel>
            );
          })}
        </div>
      </section>

      <section className="mt-13">
        <SectionHeading letter="C">État des éléments</SectionHeading>
        <div className="mt-5 flex flex-col">
          {etatRows.map(([key, label]) => (
            <div
              key={key}
              role="radiogroup"
              aria-label={label}
              className="border-border-faint flex flex-wrap items-center justify-between gap-3 border-b px-0.5 py-3.5"
            >
              <div className="text-sm font-semibold">{label}</div>
              <div className="flex gap-2">
                {etatOptions.map(([value, optionLabel]) => (
                  <ChoicePill
                    key={value}
                    dot={false}
                    selected={data.etats[key] === value}
                    onClick={() => setEtat(key, value)}
                  >
                    {optionLabel}
                  </ChoicePill>
                ))}
              </div>
            </div>
          ))}
          <div
            role="radiogroup"
            aria-label="Traces d’humidité ou moisissures"
            className="border-border-faint flex flex-wrap items-center justify-between gap-3 border-b px-0.5 py-3.5"
          >
            <div className="text-sm font-semibold">Traces d’humidité ou moisissures</div>
            <div className="flex gap-2">
              {ouiNon.map(([value, label]) => (
                <ChoicePill
                  key={value}
                  dot={false}
                  selected={data.humidite === value}
                  onClick={() => setField("humidite", value)}
                >
                  {label}
                </ChoicePill>
              ))}
            </div>
          </div>
        </div>
        <TextField
          label="Précisions utiles"
          optional
          multiline
          value={data.precisions}
          onChange={(v) => setField("precisions", v)}
          placeholder="Tout détail qui aidera le professionnel : hauteur des traces, mobilier touché, odeurs…"
          className="mt-5.5"
        />
      </section>

      <ContinueCta href="/dossier/photos">Continuer vers les photos</ContinueCta>
    </>
  );
}
