import Link from "next/link";
import { cn } from "@/lib/utils";

type CtaButtonProps = {
  href: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Extra classes — e.g. `w-full text-center` to go full-width on mobile. */
  className?: string;
};

const sizes = {
  sm: "px-5 py-2.5 text-sm shadow-cta-sm",
  md: "px-7 py-3.5 text-base shadow-cta",
  lg: "px-8 py-4 text-base shadow-cta",
} as const;

/** The yellow pill CTA — copy varies by context (hero, tarif, final band). */
export function CtaButton({ href, children, size = "md", className }: CtaButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        // No whitespace-nowrap: long contextual labels must wrap inside the
        // pill on narrow phones instead of dragging the page sideways.
        "bg-primary text-primary-foreground inline-block rounded-full text-center font-semibold transition-transform motion-safe:hover:-translate-y-px",
        sizes[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}
