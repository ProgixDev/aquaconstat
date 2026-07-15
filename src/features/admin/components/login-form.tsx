"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Painted-door admin login (spec 004, AC-5) — real auth arrives with the Supabase spec. */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(true);
      return;
    }
    router.push("/admin/dossiers");
  };

  return (
    <form
      onSubmit={submit}
      className="border-border-faint bg-card shadow-card mt-6 w-full max-w-sm rounded-xl border p-8"
    >
      <h1 className="font-display text-xl font-bold">Espace administration</h1>
      <div className="mt-5.5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-input bg-paper text-foreground rounded-sm border px-3.5 py-3 font-sans text-base"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-input bg-paper text-foreground rounded-sm border px-3.5 py-3 font-sans text-base"
          />
        </label>
        {error && (
          <div
            role="alert"
            className="border-destructive/30 bg-destructive-soft text-destructive rounded-sm border-[1.5px] px-4 py-3 text-sm leading-relaxed"
          >
            <strong>Identifiants incorrects.</strong> Vérifiez l’e-mail et le mot de passe, puis
            réessayez.
          </div>
        )}
        <button
          type="submit"
          className="bg-primary text-primary-foreground shadow-cta-sm flex cursor-pointer justify-center rounded-sm px-7 py-3.5 font-sans text-base font-semibold"
        >
          Se connecter
        </button>
      </div>
    </form>
  );
}
