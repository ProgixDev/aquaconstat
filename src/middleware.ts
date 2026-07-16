import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-session";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Refresh the Supabase session on every request and gate protected routes.
 * The matcher skips static assets and images for performance.
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Admin gate — a REDIRECT, not the authorization boundary.
  //
  // It only checks that a cookie is PRESENT: middleware runs on the Edge
  // runtime and cannot import @/core/env (server-only) to verify a signature.
  // Anyone can forge a cookie value and get past this line — and then meet the
  // real check in features/admin/data.ts, which verifies the HMAC before
  // returning a single record. What this buys is UX: a signed-out admin lands
  // on the login page instead of bouncing out of a data call.
  //
  // Placed before updateSession so it also sidesteps the "do not run code
  // between createServerClient and getUser()" rule in the Supabase helper.
  if (path.startsWith("/admin") && path !== "/admin/connexion") {
    if (!request.cookies.get(ADMIN_COOKIE)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/connexion";
      url.search = "";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
