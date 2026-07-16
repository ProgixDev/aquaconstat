import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { SectionBadge } from "./section-badge";

/**
 * French high punctuation (? ! ; :) takes an *espace insécable*. Applied at
 * render so the source copy stays greppable against the brief — and so a lone
 * « ? » » can never strand itself on a line of its own.
 */
const nbsp = (s: string) => s.replace(/ ([?!;:»])/g, " $1");

/**
 * The four objections from the content brief, verbatim. Each panel is a two-
 * hander: the doubt in the visitor's voice (serif, italic, in guillemets) and
 * the answer in ours, keyed off an aqua rule.
 */
const objections = [
  {
    doubt: "Et si mes photos ne suffisent pas ?",
    answer: "Nous revenons vers vous par e-mail pour toute précision, sans surcoût.",
  },
  {
    doubt: "Le devis sera-t-il accepté par mon assurance ?",
    answer:
      "Le devis est établi par un professionnel du bâtiment, détaillé poste par poste, comme un devis classique.",
  },
  {
    doubt: "Mes données et mon paiement sont-ils protégés ?",
    answer:
      "Le paiement s’effectue chez Stripe ; nous ne stockons jamais votre carte. Vos photos ne servent qu’à l’étude de votre dossier.",
  },
  {
    doubt: "Dois-je créer un compte ?",
    answer: "Non. Un dossier, un paiement, un devis. C’est tout.",
  },
] as const;

/**
 * « Réassurance » (content brief §3) — the doubts a visitor holds at the moment
 * of paying, answered on a dark stage. Replaces a testimonials block that was
 * never in the brief and whose customers do not exist: this section does the
 * same job with facts the business can actually stand behind.
 */
export function ReassuranceSection() {
  return (
    <section className="bg-navy-band relative overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=1600&q=70"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.10]"
        />
        <div className="from-navy/80 to-navy/95 absolute inset-0 bg-linear-180 via-transparent" />
        <div className="bg-grain absolute inset-0 opacity-[0.05] mix-blend-soft-light" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <div className="max-w-lg">
          <SectionBadge variant="navy">Réassurance</SectionBadge>
          <h2 className="font-display text-secondary-foreground mt-4 text-3xl leading-snug font-bold md:text-4xl">
            Ce qu’on se demande avant de payer.
          </h2>
        </div>

        <dl className="mt-10 grid gap-3 md:grid-cols-2">
          {objections.map((item, i) => (
            <Reveal key={item.doubt} delay={i * 0.07} className="h-full">
              <div className="border-aqua-pale/12 bg-navy-deep/55 rounded-panel h-full border p-6 backdrop-blur-sm md:p-7">
                {/* NBSP inside the guillemets: correct French typography, and it
                    stops a lone « » stranding itself on the next line. */}
                <dt className="font-display text-aqua-pale/75 text-lg leading-snug italic md:text-xl">
                  {`« ${nbsp(item.doubt)} »`}
                </dt>
                <dd className="border-aqua/45 text-mist/75 mt-4 border-l pl-4 text-sm leading-relaxed">
                  {nbsp(item.answer)}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
