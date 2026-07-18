"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, m } from "@/components/motion";
import { BrandLogo } from "@/components/ui/brand-logo";
import { CtaButton } from "./cta-button";

/* Absolute (« /#… ») so the dock works from the funnel pages too, where the
   header now also lives — a bare « #tarif » goes nowhere outside the landing. */
const links = [
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/#tarif", label: "Tarif" },
  { href: "/#faq", label: "FAQ" },
] as const;

/**
 * Floating navy-glass dock matched to the hero. Slides away while scrolling
 * (either direction) and returns as soon as scrolling settles; goes nearly
 * solid once past the hero so blurred light content can't wash it out.
 *
 * Below md the inline nav collapses into a menu button — otherwise the three
 * section links have no home on a phone at all.
 *
 * `docked=false` renders it sticky, in the page flow — the funnel uses this:
 * always visible (client, 2026-07-18), it reserves its own space so the form
 * below always starts clear of it.
 */
export function SiteHeader({ docked = true }: { docked?: boolean }) {
  const [hidden, setHidden] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let settle: number | undefined;
    const onScroll = () => {
      const y = window.scrollY;
      setPastHero(y > 80);
      if (y > 120) setHidden(true);
      window.clearTimeout(settle);
      settle = window.setTimeout(() => setHidden(false), 220);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(settle);
    };
  }, []);

  // Close the menu on Escape or on the first scroll — a full-screen tap-catcher
  // can't be used here (the header's motion transform would contain it to the
  // dock box), and closing on scroll is the behavior a phone user expects.
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <m.header
      animate={{ y: docked && hidden ? -110 : 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={docked ? "fixed inset-x-0 top-0 z-50 pt-4" : "sticky top-0 z-50 pt-4"}
    >
      {/* Same container as the hero (max-w-6xl, px-6/md:px-10) so the dock’s
          edges line up with the kicker rule and the stat row rule below. */}
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div
          /* Docked: translucent glass over the navy hero. Static (funnel):
             solid navy — 75 % alpha over the light funnel ground washed the
             dock into grey. */
          className={`border-aqua-pale/15 shadow-cta-sm flex items-center justify-between gap-3 rounded-full border py-2.5 pr-2.5 pl-4 backdrop-blur-xl transition-colors duration-300 sm:gap-5 sm:pl-6 ${docked ? (pastHero ? "bg-navy/95" : "bg-navy/75") : "bg-navy"}`}
        >
          <Link href="/" aria-label="Ôlala — accueil" className="flex items-center gap-3">
            {/* Brand enlarged so it imposes at a glance (client feedback,
                2026-07-18) — bigger droplet + wordmark on both platforms. The
                wordmark stays visible on phones and only drops below 360px,
                where the CTA would otherwise be pushed out of the dock. The
                slogan lives in the mobile menu + footer, not the dock (client
                preference, 2026-07-18). */}
            <BrandLogo
              variant="dark"
              markClassName="h-11 sm:h-14"
              wordmarkClassName="max-[359px]:hidden text-2xl tracking-wide sm:text-3xl sm:tracking-widest"
            />
          </Link>
          <nav className="text-aqua-pale hidden items-center gap-8 text-sm md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="after:bg-aqua-bright hover:text-secondary-foreground relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:transition-all after:duration-200 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <CtaButton href="/dossier" size="sm">
              <span className="sm:hidden">Mon dossier</span>
              <span className="hidden sm:inline">Démarrer mon dossier</span>
            </CtaButton>
            {/* Menu toggle — only below md, where the inline nav is hidden. */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="text-aqua-pale hover:text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full transition-colors md:hidden"
            >
              <span className="relative block h-3.5 w-5" aria-hidden>
                <m.span
                  className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-current"
                  animate={{ y: menuOpen ? 6 : 0, rotate: menuOpen ? 45 : 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ transformOrigin: "center" }}
                />
                <m.span
                  className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-current"
                  animate={{ opacity: menuOpen ? 0 : 1 }}
                  transition={{ duration: 0.15 }}
                />
                <m.span
                  className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-current"
                  animate={{ y: menuOpen ? -6 : 0, rotate: menuOpen ? -45 : 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ transformOrigin: "center" }}
                />
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <m.nav
              id="mobile-nav"
              key="mobile-nav"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="border-aqua-pale/15 bg-navy/95 shadow-cta mt-2 flex flex-col gap-1 rounded-3xl border p-3 backdrop-blur-xl md:hidden"
            >
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-aqua-pale hover:bg-navy-light/40 hover:text-secondary-foreground rounded-2xl px-4 py-3 text-base font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </m.nav>
          )}
        </AnimatePresence>
      </div>
    </m.header>
  );
}
