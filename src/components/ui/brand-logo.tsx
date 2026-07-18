import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "light" | "dark";
  className?: string;
  /** Extra classes for the droplet mark — sizes it per surface (`h-*`, width auto). */
  markClassName?: string;
  /** Extra classes for the wordmark — lets tight bars scale or drop it. */
  wordmarkClassName?: string;
};

/**
 * Ôlala mark — the signature photoreal droplet from the hero (`/droplet.png`),
 * so the logo and the hero read as one brand, with the two-tone Playfair
 * wordmark. `dark` is for navy surfaces.
 */
export function BrandLogo({
  variant = "light",
  className,
  markClassName,
  wordmarkClassName,
}: BrandLogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {/* The 900×900 asset centres a portrait droplet, so a square box shows it
          upright; -mx trims the transparent side margins so it sits tight to
          the wordmark. On navy, a soft aqua halo lifts the drop off the bar so
          the mark reads instantly (client, 2026-07-18). */}
      <span className="relative flex items-center">
        {variant === "dark" && (
          <span
            aria-hidden
            className="from-aqua-bright/40 absolute -inset-1.5 rounded-full bg-radial to-transparent to-70% blur-md"
          />
        )}
        <Image
          src="/droplet.png"
          alt=""
          aria-hidden
          width={30}
          height={30}
          className={cn(
            "relative -mx-1 h-[30px] w-auto drop-shadow-[0_2px_6px_rgba(127,200,248,0.45)]",
            markClassName,
          )}
        />
      </span>
      <span
        className={cn(
          "font-display text-base font-bold tracking-widest",
          variant === "dark" ? "text-secondary-foreground" : "text-foreground",
          wordmarkClassName,
        )}
      >
        <span className="from-aqua-bright to-aqua bg-linear-90 bg-clip-text text-transparent">
          Ô
        </span>
        LALA
      </span>
    </span>
  );
}
