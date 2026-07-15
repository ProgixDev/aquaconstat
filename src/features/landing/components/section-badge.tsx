import { cn } from "@/lib/utils";
import { DropletGlyph } from "@/components/ui/droplet-glyph";

type SectionBadgeProps = {
  children: React.ReactNode;
  variant?: "light" | "navy";
};

/** Plain wide-tracked eyebrow — no pill box, just type and the droplet mark. */
export function SectionBadge({ children, variant = "light" }: SectionBadgeProps) {
  return (
    <div
      className={cn(
        "tracking-eyebrow flex items-center gap-2.5 text-xs font-semibold uppercase",
        variant === "light" ? "text-link" : "text-aqua-pale",
      )}
    >
      <DropletGlyph />
      {children}
    </div>
  );
}
