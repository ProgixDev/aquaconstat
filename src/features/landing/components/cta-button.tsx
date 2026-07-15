import Link from "next/link";
import { cn } from "@/lib/utils";

type CtaButtonProps = {
  href: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "px-5 py-2.5 text-sm shadow-cta-sm",
  md: "px-7 py-3.5 text-base shadow-cta",
  lg: "px-8 py-4 text-base shadow-cta",
} as const;

/** The yellow pill CTA — « Démarrer mon dossier » wherever it appears. */
export function CtaButton({ href, children, size = "md" }: CtaButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "bg-primary text-primary-foreground inline-block rounded-full font-semibold whitespace-nowrap transition-transform motion-safe:hover:-translate-y-px",
        sizes[size],
      )}
    >
      {children}
    </Link>
  );
}
