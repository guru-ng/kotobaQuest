/**
 * Date helpers that work in the user's LOCAL calendar day.
 *
 * `toISOString()` is UTC, so in Japan (UTC+9) the "day" would flip at 9am.
 * Everything that counts days (streaks, daily goals, daily puzzles, SRS due
 * dates) should go through these helpers instead.
 */

/** YYYY-MM-DD for the local calendar day of `d`. */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Whole calendar days from `fromKey` to `toKey` (both YYYY-MM-DD). NaN if either is invalid. */
export function dayDiff(fromKey: string, toKey: string): number {
  const a = DATE_KEY_RE.exec(fromKey);
  const b = DATE_KEY_RE.exec(toKey);
  if (!a || !b) return NaN;
  const fromUtc = Date.UTC(Number(a[1]), Number(a[2]) - 1, Number(a[3]));
  const toUtc = Date.UTC(Number(b[1]), Number(b[2]) - 1, Number(b[3]));
  return Math.round((toUtc - fromUtc) / 86_400_000);
}

/** Date key `days` after `key`. */
export function addDaysToKey(key: string, days: number): string {
  const m = DATE_KEY_RE.exec(key);
  if (!m) return key;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days);
  return localDateKey(d);
}
