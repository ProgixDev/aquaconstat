import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { deleteDossierPhotos } = vi.hoisted(() => ({ deleteDossierPhotos: vi.fn() }));
vi.mock("./photos", () => ({ deleteDossierPhotos }));

const { createAdminClient } = vi.hoisted(() => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient }));

import { PAID_RETENTION_DAYS, UNPAID_RETENTION_DAYS, purgeExpiredDossiers } from "./retention";

describe("retention windows", () => {
  it("matches the windows the client confirmed and the confidentialité page states", () => {
    expect(PAID_RETENTION_DAYS).toBe(365); // ~12 months
    expect(UNPAID_RETENTION_DAYS).toBe(7);
  });
});

describe("purgeExpiredDossiers — simulation", () => {
  it("does nothing without a service-role key (no DB, no bucket)", async () => {
    // The test env has no SUPABASE_SERVICE_ROLE_KEY.
    expect(await purgeExpiredDossiers()).toEqual({ purged: 0, references: [] });
    expect(createAdminClient).not.toHaveBeenCalled();
    expect(deleteDossierPhotos).not.toHaveBeenCalled();
  });
});
