import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/core/env";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session";
import { logger } from "@/lib/logger";

let warned = false;

/**
 * Whether this request carries a valid admin session.
 *
 * Fails closed on every path: no secrets configured, no cookie, bad signature,
 * expired — all false. There is no branch that returns true by default.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const { ADMIN_PASSWORD, ADMIN_SESSION_SECRET } = env;
  if (!ADMIN_PASSWORD || !ADMIN_SESSION_SECRET) {
    if (!warned) {
      warned = true;
      logger.warn(
        "ADMIN_PASSWORD / ADMIN_SESSION_SECRET are unset — the admin area is locked. Set them in .env.local.",
      );
    }
    return false;
  }
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token, ADMIN_SESSION_SECRET, ADMIN_PASSWORD, Date.now());
}

/**
 * The authorization boundary (SEC-AUTHZ-001). Call this from the data layer,
 * not just from a layout.
 *
 * A layout is NOT a reliable gate: Next skips rendering a layout segment when
 * the client's `Next-Router-State-Tree` header claims it is already present,
 * and that header is shape-validated, never authenticated. `generateMetadata`
 * also runs independently of the layout. So the check has to sit next to the
 * data itself, where it cannot be routed around.
 */
export async function requireAdminSession(): Promise<void> {
  if (await isAdminAuthenticated()) return;
  redirect("/admin/connexion");
}
