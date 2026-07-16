import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The navy underwater caustics wash — the hero's atmosphere, made reusable so
 * other navy surfaces (the admin sign-in) share the exact same sea rather than
 * a look-alike. Purely decorative: fixed inset, behind its siblings.
 *
 * The gradient here sits a touch darker than the hero's so text and a glass
 * card stay legible without a droplet drawing the eye.
 */
export function SeaBackdrop({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="animate-caustics-drift absolute inset-0 will-change-transform">
        <Image
          src="https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=1600&q=70"
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover opacity-25"
        />
      </div>
      <div className="from-navy/85 via-navy/55 to-navy-deep/90 absolute inset-0 bg-linear-180" />
      <div className="bg-grain absolute inset-0 opacity-[0.05] mix-blend-soft-light" />
    </div>
  );
}
