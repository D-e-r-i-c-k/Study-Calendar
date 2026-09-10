// The DB stores clock times as "HH:MM" strings. Every comparison and offset in
// the engine happens in minutes-since-midnight, so conversion lives here.

const MINUTES_IN_DAY = 24 * 60;

export function toMinutes(time: string | null | undefined, fallback = 0): number {
  if (!time) return fallback;

  // The stored format tolerates a missing colon ("1430"), so normalise first.
  const normalised = time.includes(":")
    ? time
    : `${time.slice(0, 2)}:${time.slice(2, 4)}`;

  const [hours, minutes] = normalised.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return fallback;

  return hours * 60 + minutes;
}

export function toTimeString(minutes: number): string {
  const clamped = Math.max(0, Math.min(MINUTES_IN_DAY - 1, Math.round(minutes)));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** Half-open overlap: [aStart, aEnd) against [bStart, bEnd). */
export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}
