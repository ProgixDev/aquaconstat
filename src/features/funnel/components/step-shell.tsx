import Link from "next/link";
import { DropletGlyph } from "@/components/ui/droplet-glyph";

const steps = [
  { label: "Dossier", href: "/dossier" },
  { label: "Questionnaire", href: "/dossier/questionnaire" },
  { label: "Photos", href: "/dossier/photos" },
  { label: "Paiement", href: "/dossier/paiement" },
] as const;

const progress = ["w-[13%]", "w-[38%]", "w-[62%]", "w-[88%]"] as const;

type StepShellProps = {
  step: 1 | 2 | 3 | 4;
  children: React.ReactNode;
};

/** Step indicator + liquid progress bar + the single funnel card. */
export function StepShell({ step, children }: StepShellProps) {
  return (
    <>
      <div className="mx-auto mt-7 w-full max-w-2xl px-5">
        <div className="flex justify-between gap-2">
          {steps.map((s, i) => {
            const index = i + 1;
            if (index < step) {
              return (
                <Link
                  key={s.label}
                  href={s.href}
                  className="text-link hover:text-link-hover flex items-center gap-2 text-xs font-semibold"
                >
                  <DropletGlyph size="md" />
                  {s.label} ✓
                </Link>
              );
            }
            return (
              <div
                key={s.label}
                aria-current={index === step ? "step" : undefined}
                className={
                  index === step
                    ? "text-foreground flex items-center gap-2 text-xs font-semibold"
                    : "text-hint flex items-center gap-2 text-xs"
                }
              >
                <DropletGlyph size="md" inactive={index > step} />
                {s.label}
              </div>
            );
          })}
        </div>
        <div className="bg-border-faint mt-2.5 h-1 overflow-hidden rounded-full">
          <div
            className={`from-aqua-bright to-aqua h-full rounded-full bg-linear-90 ${progress[step - 1]}`}
          />
        </div>
      </div>
      <main className="bg-card rounded-panel shadow-panel mx-auto mt-6 w-full max-w-2xl flex-1 px-6 pt-10 pb-14 md:px-12">
        {children}
      </main>
    </>
  );
}
