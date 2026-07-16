"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { adminLoginFormAction } from "../actions";

/**
 * Admin sign-in (spec 004, R2R 2026-07-16 — this replaced a painted door that
 * accepted any two non-empty fields and pushed to the list client-side).
 *
 * Password only: there is no user record to identify, just a shared secret
 * (ADR-0008). An e-mail field would ask for something nothing checks.
 *
 * No `required` on the input on purpose — the empty case must reach the server
 * and come back as the same generic error as a wrong password, rather than
 * being intercepted by the browser.
 */
export function LoginForm() {
  const next = useSearchParams().get("next") ?? "";
  const [state, formAction, pending] = useActionState(adminLoginFormAction, null);

  return (
    <form
      action={formAction}
      className="border-aqua-pale/15 bg-navy-deep/70 shadow-cta mt-6 w-full rounded-2xl border p-8 backdrop-blur-xl"
    >
      <h1 className="font-display text-secondary-foreground text-xl font-bold">
        Espace administration
      </h1>
      <p className="text-aqua-pale/80 mt-2 text-sm leading-relaxed">
        Cet espace contient les données personnelles de vos clients. Il est réservé à Ôlala.
      </p>
      <div className="mt-5.5 flex flex-col gap-4">
        {/* Sanitised server-side by safeRedirectPath before any redirect. */}
        <input type="hidden" name="next" value={next} />
        <label className="text-aqua-pale flex flex-col gap-1.5 text-sm font-semibold">
          Mot de passe
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            aria-invalid={state?.ok === false}
            className="border-aqua-pale/20 bg-navy/50 text-secondary-foreground placeholder:text-aqua-pale/40 focus:border-aqua-bright/70 focus:ring-aqua-bright/25 rounded-lg border px-3.5 py-3 font-sans text-base transition outline-none focus:ring-2"
          />
        </label>
        {state?.ok === false && (
          <div
            role="alert"
            className="border-destructive/45 bg-destructive/15 text-secondary-foreground rounded-lg border px-4 py-3 text-sm leading-relaxed"
          >
            <strong className="text-white">{state.error}</strong> Vérifiez votre saisie, puis
            réessayez.
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground shadow-cta mt-1 flex cursor-pointer justify-center rounded-full px-7 py-3.5 font-sans text-base font-semibold transition-transform disabled:opacity-60 motion-safe:hover:-translate-y-px"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </div>
    </form>
  );
}
