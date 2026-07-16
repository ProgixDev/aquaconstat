/**
 * Shared Intl-based formatters (docs/conventions/copy.md): user-visible dates and
 * numbers always go through these — never hand-rolled string math.
 */

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const numberFormatter = new Intl.NumberFormat("en");

export function formatDate(date: Date | number): string {
  return dateFormatter.format(date);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

const FR_MONTHS_SHORT = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
] as const;

/**
 * « 14 juil. 2026 » — hand-rolled rather than Intl, and UTC rather than local.
 *
 * Intl is the right default (see above) but not here: Node's ICU and the
 * browser's disagree on French month abbreviations, and the server and client
 * clocks disagree on the timezone. Either one renders a date that changes on
 * hydration, which React reports as a mismatch and a reader reports as a bug.
 * Deterministic beats idiomatic for a value that must survive hydration.
 */
export function formatFrShortDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getUTCDate()} ${FR_MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** « 14 juil. 2026, 9 h 12 » — French renders the hour separator as « h ». */
export function formatFrDateTime(iso: string): string {
  const date = new Date(iso);
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${formatFrShortDate(iso)}, ${date.getUTCHours()} h ${minutes}`;
}
