"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { env } from "@/core/env";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_TTL_MS,
  createSessionToken,
  safeEqual,
} from "@/lib/admin-session";
import { logger } from "@/lib/logger";
import { safeRedirectPath } from "@/lib/redirect";

const loginInput = z.object({
  password: z.string().min(1).max(256),
  next: z.string().max(512).optional(),
});

export type AdminLoginResult = { ok: true } | { ok: false; error: string };

/**
 * One message for every failure mode — wrong password, unconfigured server,
 * malformed input. Distinguishing them tells an attacker which wall they hit.
 */
const GENERIC_FAILURE = "Mot de passe incorrect.";
const RATE_LIMITED = "Trop de tentatives. Réessayez dans quelques minutes.";

/**
 * Best-effort throttle (SEC-RATE-001, P3).
 *
 * A GLOBAL counter, deliberately not keyed by IP: there is exactly one
 * operator, so there is no legitimate traffic to isolate, and a per-IP map
 * would be evaded by rotating IPs, spoofable via x-forwarded-for, and would
 * grow without bound. Honest about its limits — this is per server instance
 * and resets on cold start, so it slows a script rather than stopping one. The
 * real defence is the 12+ character password.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const FAILURE_DELAY_MS = 250;
let failures = 0;
let windowStartedAt = 0;

function throttled(now: number): boolean {
  if (now - windowStartedAt > WINDOW_MS) {
    windowStartedAt = now;
    failures = 0;
  }
  return failures >= MAX_FAILURES;
}

export async function adminLoginAction(input: unknown): Promise<AdminLoginResult> {
  const parsed = loginInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC_FAILURE };

  const now = Date.now();
  if (throttled(now)) {
    logger.warn("Admin login throttled — too many failures in the current window.");
    return { ok: false, error: RATE_LIMITED };
  }

  const { ADMIN_PASSWORD, ADMIN_SESSION_SECRET } = env;
  if (!ADMIN_PASSWORD || !ADMIN_SESSION_SECRET) {
    // Fail closed: an unconfigured server refuses everyone rather than
    // admitting anyone. Loud in the log, generic to the caller.
    logger.error("Admin login attempted but ADMIN_PASSWORD / ADMIN_SESSION_SECRET are unset.");
    return { ok: false, error: GENERIC_FAILURE };
  }

  if (!(await safeEqual(parsed.data.password, ADMIN_PASSWORD))) {
    failures += 1;
    await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
    logger.warn("Admin login failed.");
    return { ok: false, error: GENERIC_FAILURE };
  }

  failures = 0;
  const token = await createSessionToken(
    ADMIN_SESSION_SECRET,
    ADMIN_PASSWORD,
    now + ADMIN_SESSION_TTL_MS,
  );
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    // Safari refuses Secure cookies on http://localhost, so gating on env is
    // what keeps local sign-in working rather than a security compromise.
    secure: env.NODE_ENV === "production",
    // "lax", not "strict": strict drops the cookie on the post-login
    // navigation and the admin would land back on the login page.
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_SESSION_TTL_MS / 1000,
  });
  logger.info("Admin signed in.");

  const target = safeRedirectPath(parsed.data.next, "/admin/dossiers");
  redirect(target.startsWith("/admin") ? target : "/admin/dossiers");
}

/**
 * useActionState adapter. FormData values arrive as `FormDataEntryValue | null`
 * and are passed through untouched — adminLoginAction's zod schema is the trust
 * boundary and rejects anything that is not a string (SEC-INPUT-001).
 */
export async function adminLoginFormAction(
  _previous: AdminLoginResult | null,
  formData: FormData,
): Promise<AdminLoginResult> {
  return adminLoginAction({
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
}

export async function adminLogoutAction(): Promise<void> {
  const store = await cookies();
  store.delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin/connexion");
}
