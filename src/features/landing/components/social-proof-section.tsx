import { SectionBadge } from "./section-badge";

/* ── Real social proof only ──────────────────────────────────────────────
   Fill these with real data as it arrives — never with invented numbers or
   quotes (fake reviews are a deceptive commercial practice). While both stay
   empty, the section states the honest position: the first reviews are being
   written. (The « Offre de lancement » 30 € counterpart was removed on client
   request, 2026-07-18 — plan change for the commercial operation.) */

/** Verbatims published with the client’s written consent — « Prénom I., Ville ». */
const temoignages: { quote: string; author: string }[] = [];

/** Real count of processed dossiers — even small (23 dossiers, c’est 23 vraies personnes). */
const dossiersTraites: number | null = null;

/**
 * « Premiers clients » — the social-proof band before Tarif. Until real
 * testimonials exist it states that honestly; once `temoignages` (and
 * optionally `dossiersTraites`) are filled, it renders the counter and
 * verbatim cards instead.
 */
export function SocialProofSection() {
  return (
    <section className="bg-info relative overflow-hidden">
      <div
        aria-hidden
        className="from-aqua-pale/40 absolute top-0 right-0 size-[28rem] translate-x-1/3 -translate-y-1/3 rounded-full bg-radial to-transparent to-70%"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
        <SectionBadge>Premiers clients</SectionBadge>
        {temoignages.length > 0 ? (
          <div className="mt-4">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Ils ont reçu leur devis.
            </h2>
            {dossiersTraites !== null ? (
              <p className="text-link font-display mt-3 text-xl font-bold">
                + de {dossiersTraites} dossiers traités
              </p>
            ) : null}
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {temoignages.map((t) => (
                <li key={t.author} className="bg-card rounded-xl p-6 shadow-sm">
                  <blockquote className="font-display text-base leading-relaxed italic">
                    « {t.quote} »
                  </blockquote>
                  <div className="text-muted-foreground mt-3.5 text-sm">— {t.author}</div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4 max-w-xl">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Nos premiers avis s’écrivent en ce moment.
            </h2>
            <p className="text-steel mt-4 text-base leading-relaxed">
              Ôlala est un service récent, et vous ne lirez ici que de vrais témoignages — il n’y en
              a donc pas encore. Plutôt que d’inventer des avis, nous préférons vous proposer
              d’écrire les premiers.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
