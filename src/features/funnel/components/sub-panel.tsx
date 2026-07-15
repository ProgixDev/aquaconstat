import { cn } from "@/lib/utils";

type SubPanelProps = {
  children: React.ReactNode;
  indent?: boolean;
  className?: string;
};

/** Conditional follow-up panel — quiet bordered surface under a selected option. */
export function SubPanel({ children, indent = false, className }: SubPanelProps) {
  return (
    <div
      className={cn(
        "border-border-faint bg-paper rounded-lg border p-4.5",
        indent && "ml-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
