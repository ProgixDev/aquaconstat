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
          <div className="mt-4">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Nos premiers avis s’écrivent en ce moment.
              </h2>
              <p className="text-steel mt-4 text-base leading-relaxed">
                Ôlala est un service récent, et vous ne lirez ici que de vrais témoignages — il n’y
                en a donc pas encore. Plutôt que d’inventer des avis, nous préférons vous proposer
                d’écrire les premiers.
              </p>
            </div>

            {/* The shape of what’s coming — visibly empty placeholders, never a
                fake review. Purely decorative, so hidden from assistive tech. */}
            <ul aria-hidden className="mt-9 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="border-border bg-card/50 rounded-xl border border-dashed p-6"
                >
                  <span className="font-display text-link/25 text-4xl leading-none">“</span>
                  <div className="mt-3 space-y-2.5">
                    <div className="bg-mist h-2.5 w-full rounded-full" />
                    <div className="bg-mist h-2.5 w-5/6 rounded-full" />
                    <div className="bg-mist h-2.5 w-2/3 rounded-full" />
                  </div>
                  <div className="text-hint mt-5 text-sm">— Votre prénom, votre ville</div>
                </li>
              ))}
            </ul>

            {/* Launch offer — the deal that turns the empty state into real proof. */}
            <div className="bg-card shadow-card border-border-faint mt-6 rounded-2xl border p-6 md:p-8">
              <div className="md:flex md:items-center md:gap-10">
                <div className="text-center md:shrink-0 md:text-left">
                  <div className="text-link text-xs font-semibold tracking-widest uppercase">
                    Offre de lancement
                  </div>
                  <div className="font-display text-foreground mt-2 text-5xl font-bold">
                    {remboursementTemoignage}
                  </div>
                  <div className="text-steel text-sm">remboursés pour votre avis</div>
                </div>

                <div className="bg-border-faint mx-auto my-6 h-px w-16 md:my-0 md:h-20 md:w-px" />

                <ol className="grid flex-1 gap-4 sm:grid-cols-3">
                  {[
                    "Recevez votre devis par e-mail.",
                    "Envoyez-nous votre retour, en toute honnêteté.",
                    "Vous êtes remboursé et votre avis est publié — prénom et ville, avec votre accord.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-left">
                      <span className="bg-aqua/15 text-link flex size-6 flex-none items-center justify-center rounded-full text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-ink-soft text-sm leading-snug">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="border-border-faint mt-6 flex flex-col items-center gap-3 border-t pt-6 sm:flex-row sm:justify-between">
                <span className="text-hint text-sm">
                  Un geste simple, un vrai témoignage — jamais d’avis inventé.
                </span>
                <a
                  href="mailto:contact@olala.fr?subject=Mon%20t%C3%A9moignage%20%C3%94lala"
                  className="bg-secondary text-secondary-foreground shadow-cta-sm inline-block rounded-full px-6 py-3 text-sm font-semibold whitespace-nowrap transition-transform motion-safe:hover:-translate-y-px"
                >
                  Partager mon avis
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
