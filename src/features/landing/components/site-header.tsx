"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { m } from "@/components/motion";
import { BrandLogo } from "@/components/ui/brand-logo";
import { CtaButton } from "./cta-button";

const links = [
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#tarif", label: "Tarif" },
  { href: "#faq", label: "FAQ" },
] as const;

/**
 * Floating navy-glass dock matched to the hero. Slides away while scrolling
 * down and returns on scroll-up or as soon as scrolling stops.
 */
export function SiteHeader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let settle: number | undefined;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 120 && y > lastY);
      lastY = y;
      window.clearTimeout(settle);
      settle = window.setTimeout(() => setHidden(false), 250);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(settle);
    };
  }, []);

  return (
    <m.header
      animate={{ y: hidden ? -110 : 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
    >
      <div className="bg-navy/75 border-aqua-pale/15 shadow-cta-sm mx-auto flex max-w-4xl items-center justify-between gap-5 rounded-full border py-2.5 pr-2.5 pl-6 backdrop-blur-xl">
        <Link href="/" aria-label="AquaConstat — accueil">
          <BrandLogo variant="dark" />
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
        <CtaButton href="/dossier" size="sm">
          Démarrer mon dossier
        </CtaButton>
      </div>
    </m.header>
  );
}
