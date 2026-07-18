import Link from "next/link";
import { cn } from "@/lib/utils";

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Back navigation as a visible button — the bare « ← Retour… » text links
 * didn't read as clickable (client feedback, 2026-07-18). Ghost pill: present
 * enough to be found, quiet enough to never compete with the yellow CTA.
 */
export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "border-border-soft bg-paper text-steel hover:border-link hover:text-link inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:-translate-x-0.5",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5"
      >
        <path d="M13 8H3M7.5 3.5 3 8l4.5 4.5" />
      </svg>
      {children}
    </Link>
  );
}
