"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Signature hero droplet (design brief §3) — a procedural glass raindrop in
 * three.js with real transmission/refraction (water IOR). Scroll scrubs its
 * rotation and downward travel; fast scrolling triggers a splash: squash-and-
 * stretch plus expanding ripple rings. The CSS poster below renders first and
 * stays for reduced-motion, WebGL failures, and while three.js streams in —
 * the layout is always complete without the 3D (AC-5).
 */
export function HeroDroplet() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const idle =
      "requestIdleCallback" in window
        ? window.requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 200);

    idle(async () => {
      if (disposed) return;
      try {
        const THREE = await import("three");
        const { RoomEnvironment } =
          await import("three/examples/jsm/environments/RoomEnvironment.js");
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.inset = "0";
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

        const camera = new THREE.PerspectiveCamera(
          35,
          mount.clientWidth / mount.clientHeight,
          0.1,
          30,
        );
        camera.position.set(0, 0.1, 6);

        const key = new THREE.DirectionalLight(0xeaf4fe, 2.4);
        key.position.set(-3, 4, 5);
        scene.add(key);
        const rim = new THREE.PointLight(0x7fc8f8, 14);
        rim.position.set(3.5, -1, -3);
        scene.add(rim);
        scene.add(new THREE.AmbientLight(0x133a5f, 1.4));

        // Teardrop profile: r = sin(u)·sin(u/2)^1.2 — pointed top, round belly.
        const points: InstanceType<typeof THREE.Vector2>[] = [];
        const SEGMENTS = 48;
        for (let i = 0; i <= SEGMENTS; i++) {
          const u = (i / SEGMENTS) * Math.PI;
          const r = Math.sin(u) * Math.pow(Math.sin(u / 2), 1.2) * 1.15;
          points.push(new THREE.Vector2(Math.max(r, 0.0001), -Math.cos(u) * 1.25));
        }
        points.reverse();
        const geometry = new THREE.LatheGeometry(points, 72);
        const material = new THREE.MeshPhysicalMaterial({
          transmission: 1,
          thickness: 1.6,
          roughness: 0.06,
          ior: 1.33,
          color: 0xdff3ff,
          attenuationColor: 0x5aa9e6,
          attenuationDistance: 3.2,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          envMapIntensity: 1.15,
        });
        const drop = new THREE.Mesh(geometry, material);
        const group = new THREE.Group();
        group.add(drop);
        scene.add(group);

        // Splash ripples — three expanding, fading rings under the drop.
        const ripples = Array.from({ length: 3 }, () => {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.9, 0.02, 10, 64),
            new THREE.MeshBasicMaterial({ color: 0xa8d6fa, transparent: true, opacity: 0 }),
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = -1.45;
          scene.add(ring);
          return { ring, start: -1 };
        });

        let lastScrollY = window.scrollY;
        let lastSplash = 0;
        let splashStart = -1;
        let prevP = 0;
        let running = true;
        const runway = document.getElementById("hero-runway");

        const observer = new IntersectionObserver(([entry]) => {
          running = entry?.isIntersecting ?? true;
        });
        observer.observe(mount);

        const onResize = () => {
          camera.aspect = mount.clientWidth / mount.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener("resize", onResize);

        renderer.setAnimationLoop((time) => {
          if (!running) return;
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
            ripples.forEach((r, i) => (r.start = time + i * 150));
          } else if (p === 0 && Math.abs(velocity) > 14 && time - lastSplash > 1400) {
            // Mobile fallback: a quick scroll flick still splashes.
            lastSplash = time;
            splashStart = time;
            ripples.forEach((r, i) => (r.start = time + i * 150));
          }
          prevP = p;

          const t = time / 1000;
          // Story: descent to impact → brief rest → settle back up, slightly smaller.
          const fall = p < IMPACT ? Math.pow(p / IMPACT, 1.6) * 0.32 : 0.32;
          const settle = p > 0.62 ? (p - 0.62) / 0.38 : 0;
          group.rotation.y = t * 0.25 + p * Math.PI * 3;
          group.position.y = Math.sin(t * 0.9) * 0.09 * (1 - p) - fall + settle * 0.3;
          const shrink = 1 - settle * 0.14;
          group.scale.set(shrink, shrink, shrink);

          // Squash-and-stretch splash on the drop itself.
          let squash = 0;
          if (splashStart >= 0) {
            const k = (time - splashStart) / 550;
            if (k >= 1) splashStart = -1;
            else squash = Math.sin(Math.PI * k);
          }
          drop.scale.set(1 + squash * 0.28, 1 - squash * 0.42, 1 + squash * 0.28);
          drop.position.y = -squash * 0.35;

          for (const r of ripples) {
            if (r.start < 0 || time < r.start) continue;
            const k = (time - r.start) / 750;
            if (k >= 1) {
              r.start = -1;
              (r.ring.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = 0;
              continue;
            }
            const s = 0.35 + k * 2.1;
            r.ring.scale.set(s, s, s);
            (r.ring.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity =
              (1 - k) * 0.55;
          }

          renderer.render(scene, camera);
        });

        setReady(true);

        cleanup = () => {
          renderer.setAnimationLoop(null);
          observer.disconnect();
          window.removeEventListener("resize", onResize);
          geometry.dispose();
          material.dispose();
          ripples.forEach((r) => {
            r.ring.geometry.dispose();
            (r.ring.material as InstanceType<typeof THREE.MeshBasicMaterial>).dispose();
          });
          pmrem.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        // WebGL unavailable — the poster stays.
      }
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div ref={mountRef} className="absolute inset-0">
      {/* Poster fallback — fades out once the 3D scene renders. */}
      <div
        aria-hidden
        className={cn(
          "animate-droplet-float absolute inset-0 transition-opacity duration-700",
          ready && "opacity-0",
        )}
      >
        <div className="rounded-droplet-lg border-aqua-pale/40 shadow-droplet from-mist/30 via-aqua-bright/35 to-navy-light/60 absolute top-1/2 left-1/2 aspect-square w-[64%] -translate-x-1/2 -translate-y-1/2 rotate-45 border bg-linear-135 via-45%" />
        <div className="from-paper/90 absolute top-[30%] left-[36%] h-[17%] w-[12%] -rotate-12 rounded-full bg-radial to-transparent" />
      </div>
    </div>
  );
}
