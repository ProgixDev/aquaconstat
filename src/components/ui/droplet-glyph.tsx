import { cn } from "@/lib/utils";

type DropletGlyphProps = {
  size?: "sm" | "md" | "lg";
  inactive?: boolean;
  className?: string;
};

const sizes = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3.5",
} as const;

/** The flat brand droplet — logo mark, step markers, list bullets. */
export function DropletGlyph({ size = "sm", inactive = false, className }: DropletGlyphProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "rounded-droplet inline-block flex-none rotate-45",
        inactive ? "bg-input" : "from-aqua-bright to-aqua bg-linear-135",
        sizes[size],
        className,
      )}
    />
  );
}
