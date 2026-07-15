"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const RIPPLES = 4;
const SPRAY = 10;

/**
 * Signature hero droplet (design brief §3) — the photoreal raindrop from
 * design/source, animated with rAF transforms. Idle float and wobble; on the
 * desktop pinned runway, scroll scrubs the story: descend → cinematic impact
 * (light flash, ballistic spray droplets, layered ripple rings, deep squash-
 * and-stretch) → rise back home. Mobile keeps normal flow where a quick
 * scroll flick still splashes. prefers-reduced-motion gets the static image.
 */
export function HeroDroplet() {
  const dropRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const rippleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sprayRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const runway = document.getElementById("hero-runway");
    const rippleStarts: number[] = Array.from({ length: RIPPLES }, () => -1);
    const spray = Array.from({ length: SPRAY }, () => ({ start: -1, angle: 0, speed: 0 }));
    let lastScrollY = window.scrollY;
    let lastSplash = 0;
    let splashStart = -1;
    let phase: "fall" | "returning" | "home" = "fall";
    let returnStart = 0;
    let raf = 0;

    const triggerSplash = (time: number) => {
      splashStart = time;
      rippleStarts.forEach((_, i) => (rippleStarts[i] = time + i * 110));
      spray.forEach((s, i) => {
        s.start = time + 40;
        s.angle = Math.PI * (0.12 + (0.76 * i) / (SPRAY - 1)) + (Math.random() - 0.5) * 0.2;
        s.speed = 0.55 + Math.random() * 0.5;
      });
    };

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

      const IMPACT = 0.6;
      if (phase === "fall" && p >= IMPACT) {
        // The drop lands — splash, then swim back home on its own clock.
        triggerSplash(time);
        phase = "returning";
        returnStart = time + 380;
      } else if (p === 0 && Math.abs(velocity) > 14 && time - lastSplash > 1400) {
        lastSplash = time;
        triggerSplash(time);
      }
      // Re-arm the story when the user scrolls back up past the fall zone.
      if (phase !== "fall" && p < IMPACT * 0.5) phase = "fall";

      const t = time / 1000;
      // Story: scroll scrubs the descent; after impact the return is
      // time-based — the drop rises home without any further scrolling.
      const DEPTH = 16; // % of the drop's height
      let fall = 0;
      if (phase === "fall") {
        fall = p < IMPACT ? Math.pow(p / IMPACT, 1.6) * DEPTH : DEPTH;
      } else if (phase === "returning") {
        const k = Math.min(Math.max((time - returnStart) / 900, 0), 1);
        fall = DEPTH * (1 - (1 - Math.pow(1 - k, 3)));
        if (k >= 1) phase = "home";
      }
      const grounded = fall / DEPTH;
      const float = Math.sin(t * 0.9) * 3 * (1 - grounded);
      const wobble = Math.sin(t * 0.7) * 2.2 * (1 - grounded);

      // Deep squash-and-stretch on impact.
      let squash = 0;
      if (splashStart >= 0) {
        const k = (time - splashStart) / 480;
        if (k >= 1) splashStart = -1;
        else squash = Math.sin(Math.PI * k);
      }
      drop.style.transform = `translateY(${float + fall + squash * 6}%) rotate(${wobble}deg) scale(${1 + squash * 0.34}, ${1 - squash * 0.44})`;

      // Impact light flash at the base.
      const flash = flashRef.current;
      if (flash) {
        flash.style.opacity =
          splashStart >= 0
            ? String(Math.sin(Math.PI * Math.min((time - splashStart) / 320, 1)) * 0.8)
            : "0";
      }

      for (let i = 0; i < rippleStarts.length; i++) {
        const ring = rippleRefs.current[i];
        const start = rippleStarts[i] ?? -1;
        if (!ring) continue;
        if (start < 0 || time < start) {
          ring.style.opacity = "0";
          continue;
        }
        const k = (time - start) / 850;
        if (k >= 1) {
          rippleStarts[i] = -1;
          ring.style.opacity = "0";
          continue;
        }
        ring.style.transform = `translateX(-50%) scale(${0.3 + k * 2.4})`;
        ring.style.opacity = String((1 - k) * (i === 0 ? 0.9 : 0.5));
      }

      // Ballistic spray — droplets ejected on impact, pulled back by gravity.
      for (let i = 0; i < spray.length; i++) {
        const particle = sprayRefs.current[i];
        const s = spray[i];
        if (!particle || !s) continue;
        if (s.start < 0 || time < s.start) {
          particle.style.opacity = "0";
          continue;
        }
        const k = (time - s.start) / 720;
        if (k >= 1) {
          s.start = -1;
          particle.style.opacity = "0";
          continue;
        }
        const x = Math.cos(s.angle) * s.speed * k * 200;
        const rise = Math.sin(s.angle) * s.speed * 340 * k - 380 * k * k;
        if (rise < -14) {
          // Back under the surface — the droplet is gone.
          particle.style.opacity = "0";
          continue;
        }
        particle.style.transform = `translate(calc(-50% + ${x}px), ${-rise}px) scale(${1 - k * 0.5})`;
        particle.style.opacity = String((1 - k) * 0.9);
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden>
      <div
        ref={flashRef}
        style={{ transform: "translateX(-50%)" }}
        className="from-aqua-bright/70 via-aqua/30 absolute bottom-[-2%] left-1/2 h-24 w-72 rounded-full bg-radial to-transparent opacity-0 blur-md"
      />
      {Array.from({ length: RIPPLES }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            rippleRefs.current[i] = el;
          }}
          style={{ transform: "translateX(-50%)" }}
          className="border-aqua-pale absolute bottom-[2%] left-1/2 h-11 w-52 rounded-full border-2 opacity-0"
        />
      ))}
      {Array.from({ length: SPRAY }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            sprayRefs.current[i] = el;
          }}
          style={{ transform: "translateX(-50%)" }}
          className="from-mist to-aqua-bright/70 absolute bottom-[6%] left-1/2 size-2.5 rounded-full bg-linear-180 opacity-0"
        />
      ))}
      <div
        ref={dropRef}
        className="absolute inset-x-[3%] top-0 bottom-[10%] origin-[50%_88%] will-change-transform"
      >
        <Image
          src="/droplet.png"
          alt=""
          fill
          sizes="(min-width: 768px) 26rem, 18rem"
          className="object-contain"
        />
      </div>
    </div>
  );
}
