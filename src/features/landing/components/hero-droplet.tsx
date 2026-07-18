"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const RIPPLES = 4;
const SPRAY = 10;

/** Broadcast so the rest of the hero (chips, headline) can react to the landing. */
export const IMPACT_EVENT = "olala:impact";

/**
 * Signature hero droplet (design brief §3) — the photoreal raindrop from
 * design/source, animated with rAF transforms over a glassy water surface.
 * Idle float and wobble; on the desktop pinned runway, scroll scrubs the
 * story: descend → cinematic impact (light flash, ballistic spray, layered
 * ripple rings, deep squash-and-stretch) → time-based rise back home. A
 * mirrored reflection and a sharpening contact shadow anticipate the fall.
 * On mobile (no pin) the full cycle plays each time the drop scrolls into
 * view and the scrolling settles — once per visit, re-armed when it fully
 * leaves the view, so it replays like the desktop scrub without ever
 * splashing twice in one visit. prefers-reduced-motion gets the static image.
 */
export function HeroDroplet() {
  const dropRef = useRef<HTMLDivElement>(null);
  const reflectionRef = useRef<HTMLDivElement>(null);
  const reflectionWrapRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const rippleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sprayRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const runway = document.getElementById("hero-runway");
    const desktop = window.matchMedia("(min-width: 64rem)");
    const rippleStarts: number[] = Array.from({ length: RIPPLES }, () => -1);
    const spray = Array.from({ length: SPRAY }, () => ({ start: -1, angle: 0, speed: 0 }));
    let lastScrollY = window.scrollY;
    let lastSplash = 0;
    let splashStart = -1;
    let phase: "fall" | "returning" | "home" = "fall";
    let returnStart = 0;
    let autoStart = -1;
    let autoWanted = false;
    let autoSpent = false; // this visit's play used — re-arms on full exit
    let settledFrames = 0;
    let hasScrolled = false;
    let raf = 0;

    const triggerSplash = (time: number) => {
      splashStart = time;
      rippleStarts.forEach((_, i) => (rippleStarts[i] = time + i * 110));
      spray.forEach((s, i) => {
        s.start = time + 40;
        s.angle = Math.PI * (0.12 + (0.76 * i) / (SPRAY - 1)) + (Math.random() - 0.5) * 0.2;
        s.speed = 0.55 + Math.random() * 0.5;
      });
      window.dispatchEvent(new CustomEvent(IMPACT_EVENT));
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const drop = dropRef.current;
      if (!drop) return;

      const y = window.scrollY;
      const velocity = y - lastScrollY;
      lastScrollY = y;

      // Pinned-runway progress — the pin only exists at the lg breakpoint
      // (hero.tsx gates sticky + runway height on lg:).
      let p = 0;
      const rect = runway?.getBoundingClientRect();
      const pinned = desktop.matches && !!rect && rect.height - window.innerHeight > 80;
      if (pinned && rect) {
        p = Math.min(Math.max(-rect.top / (rect.height - window.innerHeight), 0), 1);
      } else {
        // Mobile: no pinned runway to scrub, so the story plays whenever the
        // droplet is in view (autoWanted, from its IntersectionObserver
        // below) AND the scrolling has stayed settled — starting the ramp
        // mid-fling burned the play behind a moving viewport, which read as
        // the animation never working. A single calm frame isn't enough
        // either: smooth scrolling eases in, so its first frames are slow too.
        // Like the desktop scrub it replays on every visit: one landed play
        // per visit (autoSpent), re-armed when the drop fully leaves the view
        // — so jiggling around it can't chain replays back-to-back. The
        // droplet sits above the fold on phones, so before any scroll the
        // dwell is long (~2 s) — the untouched-page play lands *after* the
        // entrance choreography instead of invisibly inside it. A synthetic
        // ramp then drives the same fall → impact → return machinery as the
        // desktop scrub.
        if (Math.abs(velocity) > 20) hasScrolled = true;
        settledFrames = Math.abs(velocity) < 8 ? settledFrames + 1 : 0;
        if (
          autoWanted &&
          !autoSpent &&
          autoStart < 0 &&
          settledFrames >= (hasScrolled ? 15 : 130)
        ) {
          autoStart = time;
        }
        if (autoStart >= 0) {
          p = Math.min(Math.max((time - autoStart) / 1300, 0), 1) * 0.75;
          if (phase === "home") {
            autoStart = -1;
            p = 0;
          }
        }
      }

      const IMPACT = 0.6;
      if (phase === "fall" && p >= IMPACT) {
        // The drop lands — splash, then swim back home on its own clock.
        // A landed mobile play consumes this visit's latch: only now, so a
        // fall aborted by scrolling away stays immediately replayable.
        if (autoStart >= 0) autoSpent = true;
        lastSplash = time;
        triggerSplash(time);
        phase = "returning";
        returnStart = time + 380;
      } else if (
        desktop.matches &&
        p === 0 &&
        Math.abs(velocity) > 14 &&
        time - lastSplash > 1400
      ) {
        // Desktop-only quick-flick splash at the very top of the runway (p===0,
        // before it pins). On mobile the scroll-into-view arm below is the sole
        // trigger — letting this fire too made it splash twice on one scroll:
        // once here (p still 0, page still moving) and again on the ramp.
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
      const drift = float + fall + squash * 6;
      drop.style.transform = `translateY(${drift}%) rotate(${wobble}deg) scale(${1 + squash * 0.34}, ${1 - squash * 0.44})`;

      // Mirrored reflection on the water — rises to meet the falling drop,
      // brightens as they close, and shatters (dims) during the splash.
      const reflection = reflectionRef.current;
      const reflectionWrap = reflectionWrapRef.current;
      if (reflection && reflectionWrap) {
        reflection.style.transform = `translateY(${-drift}%) scale(${1 + squash * 0.34}, ${-(1 - squash * 0.44)})`;
        reflectionWrap.style.opacity = String((0.16 + grounded * 0.3) * (1 - squash * 0.75));
      }

      // Contact shadow — wide and soft while airborne, tight and dark at
      // the surface: the classic cue that gives the fall its weight.
      const shadow = shadowRef.current;
      if (shadow) {
        shadow.style.transform = `translateX(-50%) scale(${1.65 - grounded * 0.85}, ${1.25 - grounded * 0.35})`;
        shadow.style.opacity = String(0.14 + grounded * 0.4);
      }

      // The pool swells briefly under the impact.
      const pool = poolRef.current;
      if (pool) {
        pool.style.transform = `scale(${1 + squash * 0.08}, ${1 + squash * 0.16})`;
      }

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

    // The loop reflows the page every frame (getBoundingClientRect on the
    // runway), so it only runs while the hero is actually on screen — below
    // the fold there is nothing to scrub and every frame is wasted work.
    let running = false;
    const start = () => {
      if (running) return;
      running = true;
      lastScrollY = window.scrollY; // else the gap reads as velocity and splashes
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    // Mobile: mark the droplet as "wanted" while it is well in view — the rAF
    // loop starts the fall once the scrolling has also settled, so the story
    // plays in front of resting eyes, not behind a moving viewport. One
    // *landed* play per visit (`autoSpent`, set at the impact, cleared on
    // full exit): scrolling away and back replays the story like the desktop
    // scrub, while jiggles around the 55 % line can never chain replays.
    // Ignored on desktop, where the pinned runway drives progress instead.
    const dropEl = dropRef.current;
    const dropIo = new IntersectionObserver(
      (entries) => {
        // A fast scroll can batch several crossings into one callback — only
        // the newest record reflects where the droplet actually is now.
        const entry = entries[entries.length - 1];
        if (desktop.matches || !entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          autoWanted = true;
        } else if (!entry.isIntersecting) {
          // Fully gone — next visit gets a fresh play; a fall cut short
          // mid-story is aborted (and stays unspent).
          autoWanted = false;
          autoSpent = false;
          if (autoStart >= 0 && phase === "fall") autoStart = -1;
        }
      },
      { threshold: [0, 0.55] },
    );
    if (dropEl) dropIo.observe(dropEl);

    if (!runway) {
      start();
      return () => {
        dropIo.disconnect();
        stop();
      };
    }
    const io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? start() : stop()), {
      rootMargin: "120px",
    });
    io.observe(runway);
    return () => {
      io.disconnect();
      dropIo.disconnect();
      stop();
    };
  }, []);

  return (
    <div className="animate-hero-drop-in absolute inset-0" aria-hidden>
      {/* Water surface — the glassy pool the drop lands on. */}
      <div
        className="absolute bottom-[-5%] left-1/2 h-24 w-[135%]"
        style={{ transform: "translateX(-50%)" }}
      >
        <div
          ref={poolRef}
          className="from-aqua-bright/20 via-navy-light/25 absolute inset-0 rounded-[50%] bg-radial to-transparent to-72%"
        />
        <div className="via-aqua-pale/45 absolute inset-x-[8%] top-[36%] h-[3px] rounded-full bg-linear-90 from-transparent to-transparent blur-[1.5px]" />
      </div>

      {/* Contact shadow on the surface — scrubbed by the descent. */}
      <div
        ref={shadowRef}
        style={{ transform: "translateX(-50%)" }}
        className="bg-navy-deep/70 absolute bottom-[2%] left-1/2 h-6 w-40 rounded-[50%] opacity-0 blur-md will-change-transform"
      />

      {/* Mirrored reflection below the waterline — the drop's box mirrored
          across its contact point (88% of the box, 79% of the slot), so the
          reflected underside meets the real one exactly at the surface. */}
      <div
        ref={reflectionWrapRef}
        className="absolute inset-x-[3%] top-[68%] -bottom-[58%] [mask-image:linear-gradient(to_bottom,transparent_11%,black_15%,transparent_46%)] opacity-0"
      >
        <div ref={reflectionRef} className="absolute inset-0 will-change-transform">
          <Image
            src="/droplet.png"
            alt=""
            fill
            sizes="(min-width: 768px) 26rem, 18rem"
            className="object-contain"
          />
        </div>
      </div>

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
          className="border-aqua-pale absolute bottom-[2%] left-1/2 h-11 w-52 rounded-[50%] border-2 opacity-0"
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
