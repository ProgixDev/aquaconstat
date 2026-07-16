/**
 * Admin session tokens — HMAC-SHA-256 over Web Crypto (SEC-AUTH-001).
 *
 * Deliberately pure: the secrets are arguments, never module state and never
 * read from env here. That keeps this file importable from Edge middleware and
 * from unit tests, and makes it impossible for a secret to be captured into a
 * bundle by importing it.
 *
 * Why Web Crypto and not node:crypto — middleware runs on the Edge runtime, so
 * `node:crypto` is unavailable. Why not jose/iron-session — neither is a
 * dependency, and adding one is a supply-chain review (SEC-SUPPLY-001) for
 * something ~60 lines of standard HMAC covers.
 *
 * Known limit, accepted: with no database there is no revocation list. Logout
 * clears the cookie in that browser but cannot invalidate an already-issued
 * token, so an exfiltrated token stays valid until it expires. That is why the
 * TTL is short and why the signing key is bound to the password (below).
 */

export const ADMIN_COOKIE = "ac_admin";

/** 8 h: one working day, so Nino signs in once a morning. */
export const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

/** Refuse any token claiming to outlive this, however it was signed. */
const MAX_TTL_MS = 12 * 60 * 60 * 1000;

const VERSION = "v1";
const encoder = new TextEncoder();

function base64urlEncode(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Built via the constructor, not Uint8Array.from: `from` widens the buffer to
 *  ArrayBufferLike, which crypto.subtle.verify won't accept as a BufferSource. */
function base64urlDecode(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Signing key derived from BOTH the session secret and the password.
 *
 * This is the only revocation lever available without a database: changing
 * ADMIN_PASSWORD changes the key, so every token minted under the old password
 * stops verifying. If the password ever leaks, rotating it actually ends the
 * live sessions instead of leaving them valid for another 8 hours.
 */
async function signingKey(secret: string, password: string): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const derived = await crypto.subtle.sign(
    "HMAC",
    base,
    // Domain-separated so this key can never collide with a token signature.
    encoder.encode(`${VERSION}|admin-session-key|${password}`),
  );
  return crypto.subtle.importKey("raw", derived, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

/**
 * Compare two strings without leaking their contents through timing.
 *
 * `crypto.subtle.timingSafeEqual` does not exist, and `a === b` on secrets
 * short-circuits at the first differing byte. HMAC-ing both sides under a
 * random per-call key gives two fixed-length digests whose bytes are
 * unpredictable to an attacker, so the compare below leaks nothing about the
 * inputs — including their length.
 */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const key = await crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const [digestA, digestB] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(a)),
    crypto.subtle.sign("HMAC", key, encoder.encode(b)),
  ]);
  const bytesA = new Uint8Array(digestA);
  const bytesB = new Uint8Array(digestB);
  let diff = 0;
  for (let i = 0; i < bytesA.length; i++) diff |= bytesA[i]! ^ bytesB[i]!;
  return diff === 0;
}

/** Mint `v1.<expiry>.<jti>.<signature>`. `jti` keeps two tokens from colliding. */
export async function createSessionToken(
  secret: string,
  password: string,
  expiresAt: number,
): Promise<string> {
  const jti = base64urlEncode(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const payload = `${VERSION}.${expiresAt}.${jti}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(secret, password),
    encoder.encode(payload),
  );
  return `${payload}.${base64urlEncode(signature)}`;
}

/**
 * True only for a token this server signed, unexpired, and untampered.
 * Every branch fails closed; nothing here throws on malformed input.
 */
export async function verifySessionToken(
  token: string,
  secret: string,
  password: string,
  now: number,
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [version, expiryRaw, jti, signatureRaw] = parts as [string, string, string, string];
  if (version !== VERSION) return false;

  // Strict shape BEFORE Number(), which would happily accept "0x10", "1e99"
  // and " 12" — each of which parses to something we never minted.
  if (!/^\d{1,15}$/.test(expiryRaw)) return false;
  if (!/^[A-Za-z0-9_-]{22}$/.test(jti)) return false;

  const expiresAt = Number(expiryRaw);
  // Reject the future as well as the past: a minting bug must not be able to
  // hand out a token that outlives the ceiling.
  if (expiresAt <= now || expiresAt - now > MAX_TTL_MS) return false;

  let signature: Uint8Array<ArrayBuffer>;
  try {
    signature = base64urlDecode(signatureRaw);
  } catch {
    return false;
  }
  if (signature.length !== 32) return false;

  return crypto.subtle.verify(
    "HMAC",
    await signingKey(secret, password),
    signature,
    encoder.encode(`${version}.${expiryRaw}.${jti}`),
  );
}
