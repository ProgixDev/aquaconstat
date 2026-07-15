import { cn } from "@/lib/utils";

type DropletGlyphProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3.5",
} as const;

/** The flat brand droplet — reused as step marker, list bullet, and logo mark. */
export function DropletGlyph({ size = "sm", className }: DropletGlyphProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "rounded-droplet from-aqua-bright to-aqua inline-block flex-none rotate-45 bg-linear-135",
        sizes[size],
        className,
      )}
    />
  );
}
