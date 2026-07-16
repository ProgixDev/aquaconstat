import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { adminLogoutAction } from "../actions";

/**
 * Floating navy-glass dock — the same pill as the marketing site header, so the
 * admin reads as the same product. Sticky rather than fixed: it reserves its
 * own height, so the pages below need no top-padding gymnastics, and it stays
 * put while a long dossier list scrolls.
 */
export function AdminHeader() {
  return (
    // bg-background (opaque, matching the page) so scrolling content passes
    // cleanly under the dock instead of peeking through the float gap above it;
    // pb-3 buffers the bottom so rows vanish against page colour, not sliced at
    // the pill's edge.
    <header className="bg-background sticky top-0 z-50 pt-4 pb-3">
      {/* Same container as the pages below (max-w-6xl, px-6/md:px-10) so the
          dock's edges line up with the content. */}
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="border-aqua-pale/15 shadow-cta-sm bg-navy/90 flex items-center justify-between gap-3 rounded-full border py-2.5 pr-3 pl-4 backdrop-blur-xl sm:gap-5 sm:pr-4 sm:pl-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link href="/" aria-label="AquaConstat — accueil">
              {/* No CTA competes for the pill here (unlike the marketing
                  header), so the wordmark stays down to 360px and only drops on
                  the very narrowest phones. */}
              <BrandLogo
                variant="dark"
                wordmarkClassName="max-[360px]:hidden text-sm tracking-wider sm:text-base sm:tracking-widest"
              />
            </Link>
            <span className="border-aqua-pale/25 text-aqua-pale bg-navy-light/25 hidden shrink-0 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold tracking-widest uppercase sm:inline-block">
              Administration
            </span>
          </div>
          {/* A form, not a link: until 2026-07-16 « Déconnexion » navigated to
              the login page while leaving the session cookie intact, logging
              nobody out. Clearing the cookie is a mutation, so it's server-side. */}
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="text-aqua-pale hover:text-secondary-foreground cursor-pointer rounded-full px-3 py-1.5 font-sans text-sm font-semibold transition-colors"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
