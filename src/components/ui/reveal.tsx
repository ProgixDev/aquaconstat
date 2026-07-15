"use client";

import { m } from "@/components/motion";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

/**
 * Scroll-reveal wrapper — fades content up once as it enters the viewport.
 * Children stay server-rendered; this only animates the wrapper.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.3, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </m.div>
  );
}
