"use client";

import { m } from "@/components/motion";

/**
 * Page-enter transition — templates remount per navigation, giving every route
 * a soft fade-and-rise. Transform/opacity only; MotionConfig honors
 * prefers-reduced-motion globally (docs/conventions/motion.md).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}
