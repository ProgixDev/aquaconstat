import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "light" | "dark";
  className?: string;
};

/**
 * AquaConstat mark — glossy gradient droplet over a ripple, with the
 * two-tone Playfair wordmark. `dark` is for navy surfaces.
 */
export function BrandLogo({ variant = "light", className }: BrandLogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg width="28" height="30" viewBox="0 0 24 26" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="ac-drop-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--aqua-bright)" />
            <stop offset="0.55" stopColor="var(--aqua)" />
            <stop offset="1" stopColor="var(--navy-light)" />
          </linearGradient>
        </defs>
        <ellipse cx="12" cy="24" rx="7" ry="1.6" fill="var(--aqua)" opacity="0.3" />
        <path
          d="M12 1.5C12 1.5 4.75 10.3 4.75 15.4a7.25 7.25 0 0 0 14.5 0C19.25 10.3 12 1.5 12 1.5Z"
          fill="url(#ac-drop-mark)"
        />
        <ellipse
          cx="9.3"
          cy="13.4"
          rx="1.9"
          ry="3.1"
          transform="rotate(-18 9.3 13.4)"
          fill="var(--paper)"
          opacity="0.55"
        />
      </svg>
      <span
        className={cn(
          "font-display text-base font-bold tracking-widest",
          variant === "dark" ? "text-secondary-foreground" : "text-foreground",
        )}
      >
        <span className="from-aqua-bright to-aqua bg-linear-90 bg-clip-text text-transparent">
          AQUA
        </span>
        CONSTAT
      </span>
    </span>
  );
}
