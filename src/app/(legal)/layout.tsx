import { LegalChrome } from "@/features/legal";

/** Legal segment — quiet document chrome, no marketing sections (spec 005). */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <LegalChrome>{children}</LegalChrome>;
}
