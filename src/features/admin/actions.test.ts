import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

// `vi.mock` factories are hoisted above normal consts, so the spies must be
// created with `vi.hoisted` to exist by the time the factories run.
const { requireAdminSession, get, setStatut } = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  get: vi.fn(),
  setStatut: vi.fn(),
}));

// The authorization boundary. `requireAdminSession` redirects (throws) when the
// caller has no session — these tests assert the action calls it FIRST, before
// touching any dossier.
vi.mock("./session", () => ({ requireAdminSession }));
vi.mock("@/lib/dossiers", () => ({ dossierStore: { get, setStatut } }));

import { setDossierStatut } from "./actions";

const paid = { reference: "AC-2026-0147", paidAt: "2026-07-14T14:32:00Z" };
const unpaid = { reference: "AC-2026-0150", paidAt: null };

beforeEach(() => {
  vi.clearAllMocks();
  requireAdminSession.mockResolvedValue(undefined);
});

describe("setDossierStatut", () => {
  it("requires an admin session before reading or writing anything (AC-9)", async () => {
    requireAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    await expect(setDossierStatut("AC-2026-0147", "Devis envoyé")).rejects.toThrow();
    expect(get).not.toHaveBeenCalled();
    expect(setStatut).not.toHaveBeenCalled();
  });

  it("marks a paid dossier « Devis envoyé » (AC-6)", async () => {
    get.mockResolvedValue(paid);
    const result = await setDossierStatut("AC-2026-0147", "Devis envoyé");
    expect(result).toEqual({ ok: true });
    expect(setStatut).toHaveBeenCalledWith("AC-2026-0147", "Devis envoyé", expect.any(String));
  });

  it("refuses « Devis envoyé » on an UNPAID dossier (AC-6)", async () => {
    get.mockResolvedValue(unpaid);
    expect(await setDossierStatut("AC-2026-0150", "Devis envoyé")).toEqual({
      ok: false,
      error: "unpaid",
    });
    expect(setStatut).not.toHaveBeenCalled();
  });

  it("still allows moving an unpaid dossier back to « En attente »", async () => {
    get.mockResolvedValue(unpaid);
    expect(await setDossierStatut("AC-2026-0150", "En attente")).toEqual({ ok: true });
  });

  it("rejects an unknown status and an unknown dossier", async () => {
    get.mockResolvedValue(paid);
    expect(await setDossierStatut("AC-2026-0147", "Archivé")).toEqual({
      ok: false,
      error: "invalid",
    });
    get.mockResolvedValue(null);
    expect(await setDossierStatut("AC-2026-9999", "Devis envoyé")).toEqual({
      ok: false,
      error: "notfound",
    });
    expect(setStatut).not.toHaveBeenCalled();
  });
});
