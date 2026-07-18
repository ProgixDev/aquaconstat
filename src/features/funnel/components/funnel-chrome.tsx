type FunnelChromeProps = {
  /** The site header, rendered inside the gradient — outside it, the bar sat
   *  on the page's plain white and the ground visibly changed color. */
  header?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Funnel ground — the brand's water-glass surface (the FAQ section's gradient
 * + aqua glows): a flat white page said nothing about Ôlala, and the white
 * card now floats on identity. The site header (static, in the page flow) and
 * footer frame it from the app layout; pb keeps the card off the footer.
 */
export function FunnelChrome({ header, children }: FunnelChromeProps) {
  return (
    /* No overflow-hidden here — it would break the sticky header; the glow
       circles are clipped by their own absolute wrapper instead. */
    <div className="from-mist/70 via-background to-aqua-pale/40 relative flex min-h-dvh flex-col bg-linear-160 pb-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="from-aqua-bright/20 absolute -top-24 -left-32 size-120 rounded-full bg-radial to-transparent to-70%" />
        <div className="from-aqua-pale/40 absolute -right-40 -bottom-40 size-140 rounded-full bg-radial to-transparent to-70%" />
      </div>
      {header}
      <div className="relative flex flex-1 flex-col pt-6 sm:pt-9">{children}</div>
    </div>
  );
}
