/**
 * The « devis sous 48 h ouvrées » promise, as code.
 *
 * Pure and dependency-free so the rule is testable and so changing it is a
 * one-function edit rather than a hunt through components.
 *
 * TWO ASSUMPTIONS NINO MUST CONFIRM — both isolated here on purpose:
 *
 * 1. « 48 h ouvrées » is read as TWO WORKING DAYS (the standard French
 *    consumer reading), not 48 working hours (which would be ~6 working days
 *    at 8 h/day). If it is the latter, only SLA_BUSINESS_DAYS and this comment
 *    change.
 * 2. The clock starts at PAYMENT, not at submission — the site promises the
 *    dossier is only transmitted once payment is confirmed, so an unpaid
 *    dossier is not late, it is blocked.
 *
 * Known limit: all arithmetic is UTC. A dossier paid late in the evening in
 * Europe/Paris can therefore land on the previous UTC day, shifting its
 * deadline by a day. Correct handling needs a real timezone library; this is
 * mock-data-grade and must be revisited with the backend spec. French public
 * holidays are not modelled either.
 */

/** « 48 h ouvrées » → 2 jours ouvrés. See assumption 1 above. */
export const SLA_BUSINESS_DAYS = 2;

/**
 * Espace insécable, written as an escape on purpose: French typography wants
 * it before a unit, and a literal NBSP is invisible to review — it reads as an
 * ordinary space in every diff, and mismatches only surface as a baffling
 * `expected 'X' to be 'X'` test failure.
 */
const NBSP = " ";

export type SlaKind = "blocked" | "done" | "overdue" | "due-today" | "on-track";

export type SlaState = {
  kind: SlaKind;
  /** Short French label for the row, e.g. « En retard de 3 h ». */
  label: string;
  /** Deadline in ms, or null when the clock never started (unpaid/done). */
  deadline: number | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Payment time + 2 working days, keeping the time of day.
 *
 * A dossier paid on Saturday does not consume the weekend: the clock starts on
 * the next working day, so Saturday and Monday payments share a deadline.
 */
export function deadlineFor(paidAtMs: number): number {
  const date = new Date(paidAtMs);
  while (isWeekend(date)) date.setUTCDate(date.getUTCDate() + 1);
  for (let i = 0; i < SLA_BUSINESS_DAYS; i++) {
    do {
      date.setUTCDate(date.getUTCDate() + 1);
    } while (isWeekend(date));
  }
  return date.getTime();
}

/** « 3 h » / « 2 j » / « 25 min » — never « 0 min ». */
function humanGap(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${Math.max(minutes, 1)}${NBSP}min`;
  const hours = Math.round(ms / HOUR_MS);
  if (hours < 24) return `${hours}${NBSP}h`;
  return `${Math.round(ms / DAY_MS)}${NBSP}j`;
}

function isSameUtcDay(a: number, b: number): boolean {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getUTCFullYear() === y.getUTCFullYear() &&
    x.getUTCMonth() === y.getUTCMonth() &&
    x.getUTCDate() === y.getUTCDate()
  );
}

/**
 * Where a dossier stands against the promise.
 *
 * Order matters: a sent devis is done even if it went out late, and an unpaid
 * dossier is never late — the work has not been commissioned yet.
 */
export function slaState(
  nowMs: number,
  input: { paidAtMs: number | null; sent: boolean },
): SlaState {
  if (input.sent) return { kind: "done", label: "Devis envoyé", deadline: null };
  if (input.paidAtMs === null) {
    return { kind: "blocked", label: "Paiement échoué", deadline: null };
  }

  const deadline = deadlineFor(input.paidAtMs);
  if (nowMs > deadline) {
    return { kind: "overdue", label: `En retard de ${humanGap(nowMs - deadline)}`, deadline };
  }
  const label = `À rendre dans ${humanGap(deadline - nowMs)}`;
  if (isSameUtcDay(nowMs, deadline)) return { kind: "due-today", label, deadline };
  return { kind: "on-track", label, deadline };
}
