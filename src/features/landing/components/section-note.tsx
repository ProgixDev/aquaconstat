import { cn } from "@/lib/utils";

type SectionNoteProps = {
  children: React.ReactNode;
  variant?: "light" | "navy";
  className?: string;
};

/**
 * The aside that sits opposite a section heading. A left hairline and a fixed
 * measure turn it into a deliberate margin note rather than text orphaned in
 * the corner — and one component keeps every section's note on the same
 * rhythm, which three hand-rolled copies had already drifted away from.
 */
export function SectionNote({ children, variant = "light", className }: SectionNoteProps) {
  return (
    <p
      className={cn(
        "max-w-2xs border-l pl-4 text-sm leading-relaxed text-pretty",
        variant === "navy"
          ? "border-aqua-pale/25 text-mist/65"
          : "border-border-faint text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
