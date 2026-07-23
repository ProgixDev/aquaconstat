import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-session";

/**
 * Admin gate — a REDIRECT, not the authorization boundary.
 *
 * It only checks that a cookie is PRESENT: middleware runs on the Edge runtime
 * and cannot import @/core/env (server-only) to verify a signature. Anyone can
 * forge a cookie value and get past this line — and then meet the real check in
 * features/admin/data.ts, which verifies the HMAC before returning a single
 * record. What this buys is UX: a signed-out admin lands on the login page
 * instead of bouncing out of a data call.
 *
 * Visitor auth was removed with spec 006 (AC-10) — the funnel is account-less,
 * so there is no Supabase session left to refresh here. That also lets the
 * matcher shrink to /admin: every other route is public, or an API route that
 * authenticates itself (Stripe signature, CRON_SECRET).
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path !== "/admin/connexion" && !request.cookies.get(ADMIN_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/connexion";
    url.search = "";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
