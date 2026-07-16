import { describe, expect, it } from "vitest";
import { deadlineFor, slaState } from "./sla";

const at = (iso: string) => new Date(iso).getTime();
const HOUR = 60 * 60 * 1000;
/** Escaped, not literal — see the note in sla.ts. */
const NBSP = " ";

describe("deadlineFor", () => {
  it("adds two working days inside a week", () => {
    // Mardi 14 → jeudi 16, same time of day.
    expect(deadlineFor(at("2026-07-14T09:12:00Z"))).toBe(at("2026-07-16T09:12:00Z"));
  });

  it("skips the weekend", () => {
    // Jeudi 16 + 2 jours ouvrés → lundi 20, not samedi 18.
    expect(deadlineFor(at("2026-07-16T09:00:00Z"))).toBe(at("2026-07-20T09:00:00Z"));
    // Vendredi 17 → mardi 21.
    expect(deadlineFor(at("2026-07-17T09:00:00Z"))).toBe(at("2026-07-21T09:00:00Z"));
  });

  it("does not let a weekend payment burn the clock", () => {
    // Samedi and dimanche both start Monday, so they land on mercredi 22 —
    // the same deadline as a Monday payment.
    const monday = deadlineFor(at("2026-07-20T10:00:00Z"));
    expect(deadlineFor(at("2026-07-18T10:00:00Z"))).toBe(monday);
    expect(deadlineFor(at("2026-07-19T10:00:00Z"))).toBe(monday);
  });
});

describe("slaState", () => {
  const paidAtMs = at("2026-07-14T09:00:00Z"); // deadline: jeudi 16 à 09:00

  it("reports a sent devis as done, late or not", () => {
    expect(slaState(at("2026-08-01T09:00:00Z"), { paidAtMs, sent: true }).kind).toBe("done");
  });

  it("treats an unpaid dossier as blocked, never late", () => {
    const state = slaState(at("2026-08-01T09:00:00Z"), { paidAtMs: null, sent: false });
    expect(state.kind).toBe("blocked");
    expect(state.label).toBe("Paiement échoué");
  });

  it("is on track before the deadline day", () => {
    expect(slaState(at("2026-07-15T09:00:00Z"), { paidAtMs, sent: false }).kind).toBe("on-track");
  });

  it("is due-today on the deadline day", () => {
    const state = slaState(at("2026-07-16T03:00:00Z"), { paidAtMs, sent: false });
    expect(state.kind).toBe("due-today");
    expect(state.label).toBe(`À rendre dans 6${NBSP}h`);
  });

  it("flips to overdue once the deadline passes", () => {
    const state = slaState(at("2026-07-16T12:00:00Z"), { paidAtMs, sent: false });
    expect(state.kind).toBe("overdue");
    expect(state.label).toBe(`En retard de 3${NBSP}h`);
  });

  it("counts overdue in days once it runs long", () => {
    expect(slaState(at("2026-07-18T09:00:00Z"), { paidAtMs, sent: false }).label).toBe(
      `En retard de 2${NBSP}j`,
    );
  });

  it("does not report a boundary as zero", () => {
    // Half a minute before the deadline must read as a minute, not « 0 min ».
    const state = slaState(deadlineFor(paidAtMs) - 30_000, { paidAtMs, sent: false });
    expect(state.label).toBe(`À rendre dans 1${NBSP}min`);
  });

  it("exposes the deadline for sorting", () => {
    expect(slaState(at("2026-07-15T09:00:00Z"), { paidAtMs, sent: false }).deadline).toBe(
      at("2026-07-16T09:00:00Z"),
    );
  });

  it("separates value and unit with a non-breaking space, as French requires", () => {
    const state = slaState(at("2026-07-16T12:00:00Z"), { paidAtMs, sent: false });
    expect(state.label).toContain(`3${NBSP}h`);
    expect(state.label).not.toContain("3 h");
  });

  it("is exactly on the deadline, not past it", () => {
    const deadline = deadlineFor(paidAtMs);
    expect(slaState(deadline, { paidAtMs, sent: false }).kind).not.toBe("overdue");
    expect(slaState(deadline + HOUR, { paidAtMs, sent: false }).kind).toBe("overdue");
  });
});
