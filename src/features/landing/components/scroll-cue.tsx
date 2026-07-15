"use client";

import { useEffect, useState } from "react";

/**
 * « Faites défiler » cue at the base of the pinned hero — tells first-time
 * visitors their scroll drives the droplet story, then bows out as soon as
 * they start. Desktop only (the pin is lg:-gated).
 */
export function ScrollCue() {
  const [away, setAway] = useState(false);

  useEffect(() => {
    const onScroll = () => setAway(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className={`text-aqua-pale/80 pointer-events-none absolute inset-x-0 bottom-5 hidden flex-col items-center gap-1.5 transition-opacity duration-500 lg:flex ${away ? "opacity-0" : "opacity-100"}`}
    >
      <span className="tracking-eyebrow text-[10px] font-semibold uppercase">Faites défiler</span>
      <svg
        viewBox="0 0 16 16"
        className="animate-scroll-cue size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 5.5 8 11l5.5-5.5" />
      </svg>
    </div>
  );
}
