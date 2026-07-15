import { cn } from "@/lib/utils";
import { DropletGlyph } from "@/components/ui/droplet-glyph";

type SectionBadgeProps = {
  children: React.ReactNode;
  variant?: "light" | "navy";
};

/** Uppercase eyebrow pill that opens every section, on light or navy surfaces. */
export function SectionBadge({ children, variant = "light" }: SectionBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-widest uppercase",
        variant === "light" && "bg-paper border-border text-muted-foreground border",
        variant === "navy" && "bg-paper/10 border-aqua-pale/20 text-aqua-pale border",
      )}
    >
      <DropletGlyph />
      {children}
    </div>
  );
}
