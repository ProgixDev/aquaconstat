"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Signature hero droplet (design brief §3) — the photoreal raindrop from
 * design/source, animated with rAF transforms. Idle float and wobble; on the
 * desktop pinned runway, scroll scrubs the story: descend → impact splash
 * (squash-and-stretch + expanding ripple rings) → rise back home. Mobile
 * keeps normal flow where a quick scroll flick still splashes.
 * prefers-reduced-motion gets the static image.
 */
export function HeroDroplet() {
  const dropRef = useRef<HTMLDivElement>(null);
  const rippleRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const runway = document.getElementById("hero-runway");
    const rippleStarts = [-1, -1, -1];
    let lastScrollY = window.scrollY;
    let lastSplash = 0;
    let splashStart = -1;
    let prevP = 0;
    let raf = 0;

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const drop = dropRef.current;
      if (!drop) return;

      const y = window.scrollY;
      const velocity = y - lastScrollY;
      lastScrollY = y;

      // Pinned-runway progress (desktop) — 0 on mobile where the hero
      // isn't pinned and the runway has no extra height.
      let p = 0;
      const rect = runway?.getBoundingClientRect();
      if (rect && rect.height - window.innerHeight > 80) {
        p = Math.min(Math.max(-rect.top / (rect.height - window.innerHeight), 0), 1);
      }

      const IMPACT = 0.42;
      if (prevP < IMPACT && p >= IMPACT) {
        // The drop lands — splash at the impact point of the story.
        splashStart = time;
        rippleStarts.forEach((_, i) => (rippleStarts[i] = time + i * 150));
      } else if (p === 0 && Math.abs(velocity) > 14 && time - lastSplash > 1400) {
        // Mobile fallback: a quick scroll flick still splashes.
        lastSplash = time;
        splashStart = time;
        rippleStarts.forEach((_, i) => (rippleStarts[i] = time + i * 150));
      }
      prevP = p;

      const t = time / 1000;
      // Story: descend to the impact, hold through the splash, then rise
      // back to the original floating position at full size.
      const DEPTH = 16; // % of the drop's height
      let fall: number;
      if (p < IMPACT) fall = Math.pow(p / IMPACT, 1.6) * DEPTH;
      else if (p < 0.68) fall = DEPTH;
      else fall = DEPTH * (1 - Math.pow((p - 0.68) / 0.32, 0.8));
      const grounded = fall / DEPTH;
      const float = Math.sin(t * 0.9) * 3 * (1 - grounded);
      const wobble = Math.sin(t * 0.7) * 2.2 * (1 - grounded);

      // Squash-and-stretch splash on the drop itself.
      let squash = 0;
      if (splashStart >= 0) {
        const k = (time - splashStart) / 550;
        if (k >= 1) splashStart = -1;
        else squash = Math.sin(Math.PI * k);
      }
      drop.style.transform = `translateY(${float + fall + squash * 5}%) rotate(${wobble}deg) scale(${1 + squash * 0.26}, ${1 - squash * 0.34})`;

      for (let i = 0; i < rippleStarts.length; i++) {
        const ring = rippleRefs.current[i];
        const start = rippleStarts[i] ?? -1;
        if (!ring) continue;
        if (start < 0 || time < start) {
          ring.style.opacity = "0";
          continue;
        }
        const k = (time - start) / 750;
        if (k >= 1) {
          rippleStarts[i] = -1;
          ring.style.opacity = "0";
          continue;
        }
        ring.style.transform = `translateX(-50%) scale(${0.35 + k * 2.1})`;
        ring.style.opacity = String((1 - k) * 0.55);
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(el) => {
            rippleRefs.current[i] = el;
          }}
          style={{ transform: "translateX(-50%)" }}
          className="border-aqua-pale absolute bottom-[3%] left-1/2 h-10 w-44 rounded-full border-2 opacity-0"
        />
      ))}
      <div
        ref={dropRef}
        className="absolute inset-x-[10%] top-[4%] bottom-[12%] origin-[50%_88%] will-change-transform"
      >
        <Image
          src="/droplet.png"
          alt=""
          fill
          sizes="(min-width: 768px) 20rem, 16rem"
          className="object-contain"
        />
      </div>
    </div>
  );
}
