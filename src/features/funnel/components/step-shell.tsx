import Link from "next/link";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Dossier", href: "/dossier" },
  { label: "Questionnaire", href: "/dossier/questionnaire" },
  { label: "Photos", href: "/dossier/photos" },
  { label: "Paiement", href: "/dossier/paiement" },
] as const;

/* Per-step reassurance — mirrors the « Comment ça marche » metas so the
   funnel never promises something the landing didn't. */
const stepMeta = ["2 minutes", "≈ 2 minutes", "4 à 8 photos", "Paiement sécurisé Stripe"] as const;

type StepNumber = 1 | 2 | 3 | 4;

/** « Étape N sur 4 · … » — each form renders it directly under its title. */
export function StepMeta({ step }: { step: StepNumber }) {
  return (
    <p className="text-link mt-2.5 text-sm font-semibold">
      Étape {step} sur 4 · {stepMeta[step - 1]}
    </p>
  );
}

type StepShellProps = {
  step: StepNumber;
  children: React.ReactNode;
};

/**
 * Numbered progress bar + the single funnel card. Circles carry the state
 * (done ✓ links back, the active number is highlighted, upcoming are muted);
 * connectors fill as steps complete. Labels appear from sm up — on a phone
 * the numbers alone carry the bar, and « Étape N sur 4 » under the title
 * says it in words.
 */
export function StepShell({ step, children }: StepShellProps) {
  return (
    <>
      <nav aria-label={`Étape ${step} sur 4`} className="mx-auto mt-7 w-full max-w-2xl px-5">
        <ol className="flex items-center">
          {steps.map((s, i) => {
            const index = i + 1;
            const done = index < step;
            const active = index === step;
            const circle = (
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  active &&
                    "from-aqua-bright to-aqua text-secondary-foreground ring-aqua/25 bg-linear-135 shadow-sm ring-4",
                  done && "bg-aqua text-secondary-foreground",
                  !active && !done && "border-border text-hint border bg-transparent",
                )}
              >
                {done ? "✓" : index}
              </span>
            );
            const label = (
              <span
                className={cn(
                  "hidden text-xs sm:block",
                  active && "text-foreground font-semibold",
                  done && "text-link",
                  !active && !done && "text-hint",
                )}
              >
                {s.label}
              </span>
            );
            return (
              <li
                key={s.label}
                aria-current={active ? "step" : undefined}
                className={cn("flex items-center gap-2", index < steps.length && "flex-1")}
              >
                {done ? (
                  <Link
                    href={s.href}
                    className="flex items-center gap-2 hover:opacity-80"
                    aria-label={`Revenir à l’étape ${index} — ${s.label}`}
                  >
                    {circle}
                    {label}
                  </Link>
                ) : (
                  <span className="flex items-center gap-2">
                    {circle}
                    {label}
                  </span>
                )}
                {index < steps.length ? (
                  <span
                    aria-hidden
                    className={cn(
                      "mx-1 h-1 min-w-4 flex-1 rounded-full sm:mx-2",
                      index < step ? "from-aqua-bright to-aqua bg-linear-90" : "bg-border-faint",
                    )}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
      <main className="bg-card rounded-panel shadow-panel mx-auto mt-6 w-full max-w-2xl flex-1 px-6 pt-10 pb-14 md:px-12">
        {children}
      </main>
    </>
  );
}
