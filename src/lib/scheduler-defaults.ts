// Defaults for the scheduling engine's tunable parameters.
//
// Every corresponding column on `User` is nullable, so a user who has never
// visited /preferences still schedules sensibly. Values follow app.md §5-6:
// 25m focus / 5m break, 2-3 subjects a day, spacing at day 1/2/4/7/10.

export const SCHEDULER_DEFAULTS = {
  sessionMinutes: 25,
  breakMinutes: 5,
  maxSessionsPerDay: 6,
  maxSubjectsPerDay: 3,
  weekendStartTime: "09:00",
  spacingOffsets: "1,2,4,7,10",
  offDay: 0, // Sunday
} as const;

export function parseSpacingOffsets(raw: string | null | undefined): number[] {
  const parsed = (raw ?? SCHEDULER_DEFAULTS.spacingOffsets)
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n) && n >= 1);

  return parsed.length > 0
    ? parsed
    : SCHEDULER_DEFAULTS.spacingOffsets.split(",").map(Number);
}
