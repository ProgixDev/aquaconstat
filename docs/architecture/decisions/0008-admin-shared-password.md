# 0008 — Gate the admin with a shared password, not Supabase Auth

- **Status:** Accepted
- **Date:** 2026-07-16
- **Deciders:** Houssem (Progix) — client: Nino (AquaConstat)

## Context

`/admin/*` was open. The middleware protected only `/dashboard` and `/account`, the login form
accepted any two non-empty fields and redirected client-side, and typing `/admin/dossiers` was
enough to read every dossier. The list was also value-imported into a `"use client"` component,
so all 9 records shipped inside a public `/_next/static` chunk — a path the middleware matcher
excludes by design, so the leak was outside the reach of any gate.

This is mock data today. The same code with real dossiers exposes names, addresses, phone numbers
and photographs of people's damaged homes, to the open internet, in the French market (RGPD).

ADR-0007 names Supabase SSR cookie auth as this repo's auth mechanism. But the Supabase project
is not provisioned — `src/core/env.client.ts` still falls back to `https://localhost.supabase.co`
and `public-anon-key-placeholder` — so that path cannot close the hole today, and closing it is
not something to defer. There is exactly one operator (Nino) and no user table to authenticate
against.

## Decision

Gate `/admin/*` with a **single shared password** held in `ADMIN_PASSWORD`, verified server-side
in a Server Action, issuing an **HMAC-SHA-256-signed `httpOnly` session cookie** (8 h).

- **The authorization boundary is the data layer**, `src/features/admin/data.ts`, not the layout.
  Next skips rendering a layout when the client's `Next-Router-State-Tree` header claims that
  segment is already mounted, and that header is shape-validated but never authenticated;
  `generateMetadata` runs outside the layout too. The check therefore sits next to the data,
  where nothing can route around it. Middleware and the layout are defence-in-depth and UX.
- **Missing secrets fail closed.** Both vars are `.optional()` in `src/core/env.ts` — the schema
  is parsed at module load and `pnpm verify` runs `pnpm build`, so requiring them would break the
  build for anyone without secrets. Unset means every login is denied, never that the gate opens.
- **The session key is derived from the secret AND the password**, so rotating `ADMIN_PASSWORD`
  invalidates every live session — the only revocation lever available without a database.
- **No new dependency.** Web Crypto only (`jose`, `iron-session`, `bcrypt` are all absent, and
  middleware runs on Edge where `node:crypto` does not exist).

## Alternatives considered

| Option                                         | Why not                                                                                                                                                                                                                                   |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase Auth now (ADR-0007)                   | Blocked on infrastructure: no project provisioned, env still placeholders. Correct destination, wrong timeline — the hole is open now. Also authenticates a user table that does not exist for one operator.                              |
| Client-side password check                     | Not security. The password would ship in the JS bundle and the URL would still be reachable. Rejected outright.                                                                                                                           |
| Full signature verification in Edge middleware | Middleware cannot import `@/core/env` (`server-only`). Reading `process.env` directly there does work — only `NEXT_PUBLIC_*` is ever inlined — but with the data-layer check in place it buys nothing and costs an SEC-ENV-001 exception. |
| HTTP Basic auth at the edge/host               | No sign-out, browser-chrome UI, password re-sent on every request, and it moves the control off the repo where nothing can test it.                                                                                                       |
| Per-IP rate-limit map                          | Evaded by rotating IPs, spoofable via `x-forwarded-for`, unbounded memory. A global failure counter is honest about what it can do for a single-operator app.                                                                             |

## Consequences

- Positive: `/admin/*` is genuinely closed today, with no infrastructure and no new dependency.
  The gate is covered by e2e — including a forged cookie and an RSC layout-skip — and the session
  primitives by unit tests.
- Negative / accepted trade-offs:
  - **No identity.** The password authenticates "whoever holds the secret", not a person: no
    audit trail of who read which dossier. Fine for one operator; **revisit before a second
    person gets access**.
  - **No revocation list.** Logout clears the cookie in that browser but cannot invalidate an
    issued token; a stolen token is valid until it expires. Rotating the password is the lever.
  - **Rotation needs an env change + redeploy.** There is no self-service password reset.
  - **Rate limiting is best-effort** (SEC-RATE-001, P3): per-instance, in-memory, lost on cold
    start.
- Follow-ups required:
  - `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` must be set in `.env.local` (and in the host's env
    at deploy). Unset = admin locked.
  - Supersede this ADR when the Supabase backend spec lands: replace the shared password with
    real accounts, keep `requireAdminSession()`'s call sites (the data layer) as the boundary —
    only its implementation should change.
