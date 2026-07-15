"use client";

import { cn } from "@/lib/utils";

type ChoiceCardProps = {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  checkbox?: boolean;
};

/** Full-width option card — radio circle by default, checkbox square when multi-select. */
export function ChoiceCard({ selected, onClick, children, checkbox = false }: ChoiceCardProps) {
  return (
    <button
      type="button"
      role={checkbox ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "border-input bg-paper text-foreground flex cursor-pointer items-start gap-3 rounded-sm border p-3.5 text-left font-sans text-sm",
        selected && "ring-aqua ring-2",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "border-hint bg-paper mt-px flex size-4.5 flex-none items-center justify-center border-[1.5px]",
          checkbox ? "rounded-xs" : "rounded-full",
        )}
      >
        <span
          className={cn(
            "size-2.5",
            checkbox ? "rounded-xs" : "rounded-full",
            selected && "bg-aqua",
          )}
        />
      </span>
      <span>{children}</span>
    </button>
  );
}
