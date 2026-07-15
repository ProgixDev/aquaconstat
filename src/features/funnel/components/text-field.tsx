"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
  hint?: string;
  error?: string;
  type?: "text" | "email" | "tel" | "date";
  inputMode?: "decimal" | "numeric";
  placeholder?: string;
  multiline?: boolean;
  className?: string;
};

/** Labelled funnel input — hint below, error state per the prototype. */
export function TextField({
  label,
  value,
  onChange,
  optional = false,
  hint,
  error,
  type = "text",
  inputMode,
  placeholder,
  multiline = false,
  className,
}: TextFieldProps) {
  const id = useId();
  const inputClasses = cn(
    "text-foreground rounded-sm border px-3.5 py-3 font-sans text-base",
    error ? "border-destructive/60 bg-destructive-soft" : "border-input bg-field",
  );
  return (
    <div className={cn("flex flex-col gap-1.5 text-sm font-semibold", className)}>
      <label htmlFor={id}>
        {label} {optional && <span className="text-hint font-normal">(facultatif)</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClasses, "resize-y")}
        />
      ) : (
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          className={inputClasses}
        />
      )}
      {error ? (
        <span className="text-destructive text-xs font-semibold">{error}</span>
      ) : (
        hint && <span className="text-muted-foreground text-xs font-normal">{hint}</span>
      )}
    </div>
  );
}
