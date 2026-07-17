import { SectionBadge } from "./section-badge";

/* ── Real social proof only ──────────────────────────────────────────────
   Fill these with real data as it arrives — never with invented numbers or
   quotes (fake reviews are a deceptive commercial practice). While both stay
   empty, the section shows the launch offer instead: first clients get a
   gesture in exchange for a real, publishable testimonial. */

/** Verbatims published with the client’s written consent — « Prénom I., Ville ». */
const temoignages: { quote: string; author: string }[] = [];

/** Real count of processed dossiers — even small (23 dossiers, c’est 23 vraies personnes). */
const dossiersTraites: number | null = null;

/** Refunded for a published testimonial — amount to validate with the client. */
const remboursementTemoignage = "30 €";

/**
 * « Premiers clients » — the social-proof band before Tarif. Until real
 * testimonials exist it proposes the deal that creates them; once
 * `temoignages` (and optionally `dossiersTraites`) are filled, it renders
 * the counter and verbatim cards instead.
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
          <div className="mt-4 gap-12 md:flex md:items-start md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Nos premiers avis s’écrivent en ce moment.
              </h2>
              <p className="text-steel mt-4 text-base leading-relaxed">
                Ôlala est un service récent, et vous ne lirez ici que de vrais témoignages — il n’y
                en a donc pas encore. Plutôt que d’inventer des avis, nous préférons vous proposer
                d’écrire les premiers.
              </p>
            </div>
            <div className="bg-card mt-8 max-w-md rounded-xl p-6 shadow-sm md:mt-0 md:shrink-0">
              <div className="text-link text-xs font-semibold tracking-widest uppercase">
                Offre de lancement
              </div>
              <p className="text-ink-soft mt-3 text-sm leading-relaxed">
                Après réception de votre devis, envoyez-nous votre retour : nous vous remboursons{" "}
                <strong className="font-semibold">{remboursementTemoignage}</strong> et publions
                votre témoignage ici — prénom et ville uniquement, avec votre accord.
              </p>
              <a
                href="mailto:contact@olala.fr?subject=Mon%20t%C3%A9moignage%20%C3%94lala"
                className="text-link hover:text-link-hover mt-4 inline-block text-sm font-semibold"
              >
                contact@olala.fr
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
