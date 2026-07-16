"use client";

import Link from "next/link";
import { useFunnelStore } from "../provider";
import type { Statut, TypeLieu } from "../types";
import { ChoiceCard } from "./choice-card";
import { ContinueCta } from "./continue-cta";
import { StepMeta } from "./step-shell";
import { TextField } from "./text-field";

const typeLieuOptions: [TypeLieu, string][] = [
  ["maison", "Maison particulière"],
  ["copro", "Immeuble en copropriété"],
  ["locatif", "Immeuble locatif"],
];

const statutOptions: [Statut, string][] = [
  ["locataire", "Locataire ou occupant non propriétaire"],
  ["proprio", "Propriétaire / copropriétaire"],
  ["syndic", "Syndic de copropriété"],
  ["gerant", "Gérant de l’immeuble / agence"],
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Étape 1 — coordonnées, lieu du sinistre, statut. */
export function DossierForm() {
  const data = useFunnelStore((s) => s.data);
  const setField = useFunnelStore((s) => s.setField);

  const emailError =
    data.email !== "" && !emailPattern.test(data.email)
      ? "Vérifiez le format de l’adresse — par exemple : camille.moreau@gmail.com"
      : undefined;
  const showSyndic = data.typeLieu === "copro" || data.typeLieu === "locatif";

  return (
    <>
      <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">
        ← Retour à l’accueil
      </Link>
      <h1 className="font-display mt-4.5 text-3xl font-bold md:text-[34px]">
        Créons votre dossier
      </h1>
      <StepMeta step={1} />
      {/* The constat-amiable promise went with the assurance fieldset on
          2026-07-16: the form no longer mirrors that document, so it must not
          say it does. */}
      <p className="text-steel mt-3.5 text-base leading-relaxed">
        Ces informations figureront sur votre devis.
      </p>

      {/* Engagement checkbox (client, 2026-07-16) — checked by default: the
          visitor confirms the situation the whole funnel solves, before
          typing anything. */}
      <div className="mt-7">
        <ChoiceCard
          checkbox
          selected={data.assuranceReclame}
          onClick={() => setField("assuranceReclame", !data.assuranceReclame)}
        >
          Votre compagnie d’assurance vous réclame un devis pour débloquer votre dossier ?
        </ChoiceCard>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold">Vos coordonnées</h2>
        <div className="mt-5 grid gap-4.5 sm:grid-cols-2">
          <TextField label="Prénom" value={data.prenom} onChange={(v) => setField("prenom", v)} />
          <TextField label="Nom" value={data.nom} onChange={(v) => setField("nom", v)} />
          <TextField
            label="E-mail"
            type="email"
            value={data.email}
            onChange={(v) => setField("email", v)}
            hint="Votre devis sera envoyé à cette adresse."
            error={emailError}
          />
          <TextField
            label="Téléphone"
            type="tel"
            value={data.telephone}
            onChange={(v) => setField("telephone", v)}
            hint="Format : 06 12 34 56 78"
          />
        </div>
      </section>

      <section className="mt-11">
        <h2 className="font-display text-lg font-bold">Le lieu du sinistre</h2>
        <div className="mt-5 flex flex-col gap-4.5">
          <TextField
            label="Adresse complète"
            value={data.adresse}
            onChange={(v) => setField("adresse", v)}
          />
          <div className="grid grid-cols-2 gap-4.5 sm:grid-cols-4">
            <TextField
              label="Bât."
              optional
              value={data.batiment}
              onChange={(v) => setField("batiment", v)}
            />
            <TextField
              label="Étage"
              optional
              value={data.etage}
              onChange={(v) => setField("etage", v)}
            />
            <TextField
              label="Code postal"
              value={data.codePostal}
              onChange={(v) => setField("codePostal", v)}
            />
            <TextField label="Ville" value={data.ville} onChange={(v) => setField("ville", v)} />
          </div>
          <div role="radiogroup" aria-label="Il s’agit de">
            <div className="text-sm font-semibold">Il s’agit de :</div>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
              {typeLieuOptions.map(([value, label]) => (
                <ChoiceCard
                  key={value}
                  selected={data.typeLieu === value}
                  onClick={() => setField("typeLieu", value)}
                >
                  {label}
                </ChoiceCard>
              ))}
            </div>
          </div>
          {showSyndic && (
            <TextField
              label="Nom, adresse et téléphone du syndic ou du gérant"
              optional
              value={data.syndic}
              onChange={(v) => setField("syndic", v)}
            />
          )}
        </div>
      </section>

      <section className="mt-11">
        <h2 className="font-display text-lg font-bold">Vous êtes</h2>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Vous êtes">
          {statutOptions.map(([value, label]) => (
            <ChoiceCard
              key={value}
              selected={data.statut === value}
              onClick={() => setField("statut", value)}
            >
              {label}
            </ChoiceCard>
          ))}
        </div>
        {/* The locataire / propriétaire sub-panels (coordonnées du
            propriétaire, résiliation du bail, location meublée, occupant)
            were removed 2026-07-16 (client): none of it changes the price of
            the work, so the statut alone is enough. */}
      </section>

      {/* « Votre assurance » removed 2026-07-16 (client): nobody has their n° de
          contrat to hand mid-form, and none of it is required on a devis de
          travaux. It was the single biggest drop-off risk on the page. */}

      <ContinueCta href="/dossier/questionnaire">Continuer vers le questionnaire</ContinueCta>
    </>
  );
}
