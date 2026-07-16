import { describe, expect, it } from "vitest";
import { createSessionToken, safeEqual, verifySessionToken } from "./admin-session";

const SECRET = "test-session-secret-at-least-32-chars-long";
const PASSWORD = "test-admin-password";
const NOW = 1_800_000_000_000;
const LATER = NOW + 60_000;

describe("safeEqual", () => {
  it("matches identical strings", async () => {
    await expect(safeEqual("motdepasse", "motdepasse")).resolves.toBe(true);
  });

  it("rejects a near-miss, a prefix, and a length mismatch", async () => {
    await expect(safeEqual("motdepasse", "motdepassE")).resolves.toBe(false);
    await expect(safeEqual("motdepasse", "motdepass")).resolves.toBe(false);
    await expect(safeEqual("motdepasse", "")).resolves.toBe(false);
  });
});

describe("verifySessionToken", () => {
  it("accepts a token it just minted", async () => {
    const token = await createSessionToken(SECRET, PASSWORD, LATER);
    await expect(verifySessionToken(token, SECRET, PASSWORD, NOW)).resolves.toBe(true);
  });

  it("mints a distinct token each time (jti)", async () => {
    const a = await createSessionToken(SECRET, PASSWORD, LATER);
    const b = await createSessionToken(SECRET, PASSWORD, LATER);
    expect(a).not.toEqual(b);
  });

  it("rejects an expired token", async () => {
    const token = await createSessionToken(SECRET, PASSWORD, NOW - 1);
    await expect(verifySessionToken(token, SECRET, PASSWORD, NOW)).resolves.toBe(false);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken("another-secret-that-is-32-chars-min", PASSWORD, LATER);
    await expect(verifySessionToken(token, SECRET, PASSWORD, NOW)).resolves.toBe(false);
  });

  // The revocation lever: rotating the password must end live sessions.
  it("rejects a token minted under a previous password", async () => {
    const token = await createSessionToken(SECRET, "old-password", LATER);
    await expect(verifySessionToken(token, SECRET, "rotated-password", NOW)).resolves.toBe(false);
  });

  it("rejects a tampered expiry even though the signature is well-formed", async () => {
    const token = await createSessionToken(SECRET, PASSWORD, LATER);
    const [version, , jti, signature] = token.split(".");
    const forged = [version, String(NOW + 60 * 60 * 1000), jti, signature].join(".");
    await expect(verifySessionToken(forged, SECRET, PASSWORD, NOW)).resolves.toBe(false);
  });

  it("rejects an expiry that parses but was never minted", async () => {
    // Number() accepts all of these; the strict regex must reject them first.
    for (const expiry of ["0x10", "1e99", " 12", "12.5", "-1", ""]) {
      const forged = `v1.${expiry}.aaaaaaaaaaaaaaaaaaaaaa.${"A".repeat(43)}`;
      await expect(verifySessionToken(forged, SECRET, PASSWORD, NOW)).resolves.toBe(false);
    }
  });

  it("rejects a token claiming to outlive the ceiling", async () => {
    const token = await createSessionToken(SECRET, PASSWORD, NOW + 365 * 24 * 60 * 60 * 1000);
    await expect(verifySessionToken(token, SECRET, PASSWORD, NOW)).resolves.toBe(false);
  });

  it("rejects garbage without throwing", async () => {
    for (const token of ["", "garbage", "v1.x", "v2.1.2.3", "a.b.c.d", "....", "v1..."]) {
      await expect(verifySessionToken(token, SECRET, PASSWORD, NOW)).resolves.toBe(false);
    }
  });
});
