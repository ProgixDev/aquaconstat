"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import animationData from "./plant-loader.json";

// lottie-react pulls in lottie-web, which touches `document` at import — load it
// client-only so it never runs during SSR of this client component.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

/* Leaves adrift around the pill — each customises the shared eco-leaf-drift
   keyframe (sway distance, spin, clock, peak opacity) via --leaf-* props.
   Base opacity is 0, so when reduced motion disables the animation the
   leaves simply never appear. */
const leaves: { style: CSSProperties; size: number }[] = [
  {
    size: 14,
    style: {
      left: "4%",
      bottom: "16%",
      "--leaf-x": "-20px",
      "--leaf-r": "-55deg",
      "--leaf-t": "6.5s",
      "--leaf-d": "0s",
      "--leaf-o": 0.75,
    } as CSSProperties,
  },
  {
    size: 10,
    style: {
      left: "14%",
      bottom: "-8%",
      "--leaf-x": "12px",
      "--leaf-r": "40deg",
      "--leaf-t": "8s",
      "--leaf-d": "1.7s",
      "--leaf-o": 0.55,
    } as CSSProperties,
  },
  {
    size: 12,
    style: {
      left: "83%",
      bottom: "-6%",
      "--leaf-x": "18px",
      "--leaf-r": "65deg",
      "--leaf-t": "7s",
      "--leaf-d": "0.9s",
      "--leaf-o": 0.7,
    } as CSSProperties,
  },
  {
    size: 10,
    style: {
      left: "95%",
      bottom: "20%",
      "--leaf-x": "-14px",
      "--leaf-r": "-40deg",
      "--leaf-t": "8.5s",
      "--leaf-d": "2.9s",
      "--leaf-o": 0.5,
    } as CSSProperties,
  },
  {
    size: 9,
    style: {
      left: "52%",
      bottom: "-14%",
      "--leaf-x": "24px",
      "--leaf-r": "50deg",
      "--leaf-t": "9s",
      "--leaf-d": "4.1s",
      "--leaf-o": 0.45,
    } as CSSProperties,
  },
];

/* Pollen motes — tiny glowing specks rising among the leaves. They ride the
   same eco-leaf-drift keyframe with their own clocks, so the air feels alive
   without a second animation system. */
const motes: { style: CSSProperties; size: number }[] = [
  {
    size: 5,
    style: {
      left: "9%",
      bottom: "34%",
      "--leaf-x": "-10px",
      "--leaf-r": "0deg",
      "--leaf-t": "5.5s",
      "--leaf-d": "0.6s",
      "--leaf-o": 0.8,
    } as CSSProperties,
  },
  {
    size: 4,
    style: {
      left: "30%",
      bottom: "-10%",
      "--leaf-x": "14px",
      "--leaf-r": "0deg",
      "--leaf-t": "7.5s",
      "--leaf-d": "2.3s",
      "--leaf-o": 0.6,
    } as CSSProperties,
  },
  {
    size: 5,
    style: {
      left: "72%",
      bottom: "-8%",
      "--leaf-x": "-16px",
      "--leaf-r": "0deg",
      "--leaf-t": "6s",
      "--leaf-d": "3.4s",
      "--leaf-o": 0.7,
    } as CSSProperties,
  },
  {
    size: 4,
    style: {
      left: "91%",
      bottom: "38%",
      "--leaf-x": "12px",
      "--leaf-r": "0deg",
      "--leaf-t": "8s",
      "--leaf-d": "1.2s",
      "--leaf-o": 0.55,
    } as CSSProperties,
  },
];

function Leaf({ size }: { size: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Faint fill gives the small leaves body against the navy. */}
      <path
        fill="currentColor"
        fillOpacity="0.22"
        d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"
      />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  );
}

/**
 * « Engagement vert » — the client's headline eco argument, alive inside the
 * navy hero: a flat nature-green pill with white type, the plant-loader
 * Lottie growing out of a light soil disc, leaves and glowing pollen motes
 * drifting up around the pill on a breeze, and a green halo breathing behind
 * it. Inside the pill lives a miniature landscape: misty hills drifting on
 * the breeze along the bottom (the eco band's hills in miniature) and a
 * light glint sweeping across. The pill blooms into place after the headline
 * and lifts under the cursor. Green-and-white on navy so the pledge jumps
 * out of the first screen.
 *
 * Deferred like the rest of the landing: the player only mounts once the pledge
 * scrolls into view, and reduced-motion users get a still leaf rather than the
 * grow-loop (frame 0 of a loader is bare soil, which would read as broken) —
 * the drifting leaves and breathing halo are disabled by the global
 * reduced-motion block in globals.css.
 */
export function HeroEcoPledge() {
  const ref = useRef<HTMLDivElement>(null);
  // Read once the pledge scrolls in (window isn't available at SSR); both fields
  // are set together in the observer callback, never in the effect body.
  const [state, setState] = useState({ visible: false, reduce: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          setState({ visible: true, reduce });
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative flex justify-center">
      {/* Green halo breathing behind the pill — nature pulsing into the navy. */}
      <div
        aria-hidden
        className="from-success/35 animate-eco-breathe pointer-events-none absolute top-1/2 left-1/2 h-36 w-80 rounded-full bg-radial to-transparent to-70% blur-2xl"
      />

      <div className="animate-eco-rise relative">
        {/* Leaves adrift on the breeze around the pill. */}
        {leaves.map((leaf, i) => (
          <span
            key={i}
            aria-hidden
            style={leaf.style}
            className="text-success animate-eco-leaf pointer-events-none absolute opacity-0"
          >
            <Leaf size={leaf.size} />
          </span>
        ))}
        {/* Pollen motes glowing among the leaves. */}
        {motes.map((mote, i) => (
          <span
            key={i}
            aria-hidden
            style={{ ...mote.style, width: mote.size, height: mote.size }}
            className="bg-success animate-eco-leaf pointer-events-none absolute rounded-full opacity-0 blur-[1px]"
          />
        ))}

        <span className="border-success-soft/40 bg-success text-secondary-foreground shadow-success/60 hover:shadow-success/70 relative inline-flex items-center gap-3 rounded-full border py-2 pr-6 pl-2 shadow-[0_2px_32px_-8px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_44px_-10px] sm:gap-3.5 sm:py-2.5">
          {/* A living landscape inside the glass — warm sun breathing in the
              corner, rolling hills drifting on the breeze along the bottom
              (the eco band's hills in miniature), and a sunlight glint
              sweeping across. All behind the text. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          >
            <svg
              className="animate-eco-hills absolute bottom-0 left-0 h-1/2 w-[200%]"
              viewBox="0 0 800 60"
              preserveAspectRatio="none"
            >
              <path
                d="M0,34 C100,18 200,44 300,30 C400,16 500,42 600,26 C700,14 760,36 800,28 L800,60 L0,60 Z"
                className="fill-white/12"
              />
              <path
                d="M0,46 C120,34 240,54 360,44 C480,34 620,54 800,40 L800,60 L0,60 Z"
                className="fill-aqua-pale/15"
              />
            </svg>
            <span className="animate-eco-sheen absolute inset-y-0 left-0 w-1/2 bg-linear-90 from-transparent via-white/15 to-transparent" />
          </span>
          {/* Soil disc cradling the growing plant — a lit green ring gives it a
              planted-in-earth read even before the animation runs. */}
          <span className="border-success-soft/50 from-success-soft relative flex size-11 flex-none items-center justify-center overflow-hidden rounded-full border bg-radial from-40% to-white/70 shadow-inner sm:size-12">
            {state.visible && !state.reduce ? (
              <Lottie
                animationData={animationData}
                loop
                autoplay
                className="size-[150%] translate-y-[6%]"
              />
            ) : (
              <span className="text-success">
                <Leaf size={24} />
              </span>
            )}
          </span>

          {/* Three-tier hierarchy: eyebrow names the pledge, the figures line
              carries the punch (numbers lifted in the brand yellow), and the
              payoff sits quieter beneath — instead of one long wrapping
              sentence doing all three jobs. */}
          <span className="flex flex-col gap-0.5 text-left leading-tight">
            <span className="text-success-soft/85 text-[0.65rem] font-semibold tracking-[0.18em] uppercase">
              Engagement vert
            </span>
            <span className="font-display text-sm font-bold text-balance sm:text-base">
              <span className="text-primary">0 km</span> parcouru,{" "}
              <span className="text-primary">100 %</span> d’efficacité
            </span>
            <span className="text-success-soft/90 text-xs font-medium sm:text-[0.8rem]">
              bon pour la planète.
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
