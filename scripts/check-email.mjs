#!/usr/bin/env node
/**
 * SMTP smoke test — proves the OVH mailbox actually sends before we trust the
 * app with it. Mirrors src/lib/email.ts exactly (same host/port/secure/auth), so
 * a pass here means the funnel's operator + customer e-mails will go out.
 *
 * Usage:  node scripts/check-email.mjs [recipient@example.com]
 * Reads SMTP_* from .env.local (never printed). Not part of `pnpm verify`.
 */
import { readFileSync } from "node:fs";
import nodemailer from "nodemailer";

// Minimal .env.local parser — @next/env isn't resolvable standalone and we don't
// want a dotenv dependency just for a script (same approach as playwright.config).
function loadEnvLocal() {
  const env = {};
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env.local — fall back to process.env below */
  }
  return env;
}

// process.env wins so the vars can be supplied inline without a .env.local.
const env = { ...loadEnvLocal(), ...process.env };
const host = env.SMTP_HOST;
const port = Number(env.SMTP_PORT || 465);
const user = env.SMTP_USER;
const pass = env.SMTP_PASSWORD;
const from = env.EMAIL_FROM || user;
const to = process.argv[2] || env.OPERATOR_EMAIL || user;

const missing = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"].filter((k) => !env[k]);
if (missing.length) {
  console.error(`✗ Missing in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`→ host ${host}:${port} (secure=${port === 465})  user ${user}  →  to ${to}`);

const transport = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

try {
  await transport.verify();
  console.log("✓ Connection + authentication OK");
} catch (e) {
  console.error(`✗ Could not connect/authenticate: ${e.message}`);
  console.error("  Common OVH causes: wrong server (try ssl0.ovh.net), SMTP not");
  console.error("  yet active on a fresh mailbox, or a bad password.");
  process.exit(1);
}

try {
  const info = await transport.sendMail({
    from,
    to,
    subject: "Ôlala — test d'envoi SMTP",
    text: "Si vous lisez ceci, l'envoi d'e-mails depuis olala-degatdeseaux.fr fonctionne.",
  });
  console.log(`✓ Test e-mail sent — messageId ${info.messageId}`);
  console.log(`  Check the inbox of ${to}.`);
} catch (e) {
  console.error(`✗ Connected but send failed: ${e.message}`);
  process.exit(1);
}
