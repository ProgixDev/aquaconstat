"use client";

import { cn } from "@/lib/utils";

type ChoicePillProps = {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dot?: boolean;
  square?: boolean;
};

/** Segmented pill option — radio-style dot, or square for multi-select groups. */
export function ChoicePill({
  selected,
  onClick,
  children,
  dot = true,
  square = false,
}: ChoicePillProps) {
  return (
    <button
      type="button"
      role={square ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "border-input bg-paper text-foreground flex cursor-pointer items-center gap-2 rounded-full border px-4.5 py-2.5 font-sans text-sm",
        selected && "ring-aqua ring-2",
      )}
    >
      {dot && (
        <span
          aria-hidden
          className={cn(
            "border-hint box-border size-2.5 border-[1.5px]",
            square ? "rounded-xs" : "rounded-full",
            selected && "bg-aqua",
          )}
        />
      )}
      {children}
    </button>
  );
}
