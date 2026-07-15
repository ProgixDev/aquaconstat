import { SectionBadge } from "./section-badge";

const testimonials = [
  {
    quote: "« Devis reçu en moins de 48 h, accepté par mon assurance sans aucune question. »",
    initials: "CM",
    name: "Camille M.",
    context: "Lyon · dégât des eaux en copropriété",
  },
  {
    quote:
      "« Aucun artisan ne voulait se déplacer juste pour un devis. Ici, tout s’est fait depuis mon canapé. »",
    initials: "KH",
    name: "Karim H.",
    context: "Marseille · infiltration en façade",
  },
  {
    quote:
      "« Le questionnaire m’a pris dix minutes, photos comprises. Le devis est arrivé le lendemain. »",
    initials: "ÉF",
    name: "Élise F.",
    context: "Dijon · fuite d’appareil à effet d’eau",
  },
] as const;

const reassurances = [
  {
    q: "Et si mes photos ne suffisent pas ?",
    a: "Nous revenons vers vous par e-mail pour toute précision, sans surcoût.",
  },
  {
    q: "Le devis sera-t-il accepté par mon assurance ?",
    a: "Le devis est établi par un professionnel du bâtiment, détaillé poste par poste, comme un devis classique.",
  },
  {
    q: "Mes données et mon paiement sont-ils protégés ?",
    a: "Le paiement s’effectue chez Stripe ; nous ne stockons jamais votre carte. Vos photos ne servent qu’à l’étude de votre dossier.",
  },
  {
    q: "Dois-je créer un compte ?",
    a: "Non. Un dossier, un paiement, un devis. C’est tout.",
  },
] as const;

/** « Ils ont reçu leur devis » — editorial serif quotes, no boxes. */
export function TestimonialsSection() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <SectionBadge>Ils ont reçu leur devis</SectionBadge>
        <h2 className="font-display mt-5 text-3xl leading-snug font-bold md:text-4xl">
          Des dossiers réglés, sans déplacement.
        </h2>
        <div className="mt-14 grid gap-x-14 gap-y-12 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.initials} className="m-0 flex flex-col gap-6">
              <blockquote className="font-display text-ink-soft m-0 flex-1 text-xl leading-snug font-bold italic">
                {t.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="bg-secondary text-secondary-foreground flex size-9 flex-none items-center justify-center rounded-full text-xs font-semibold"
                >
                  {t.initials}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="text-muted-foreground block text-xs">{t.context}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="border-border-soft mt-16 grid gap-x-14 gap-y-9 border-t pt-12 sm:grid-cols-2">
          {reassurances.map((r) => (
            <div key={r.q}>
              <div className="text-base font-semibold">{r.q}</div>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{r.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
