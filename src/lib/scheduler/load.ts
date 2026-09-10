import { SCHEDULER_DEFAULTS, parseSpacingOffsets } from "@/lib/scheduler-defaults";
import type { SchedulerSettings, SchedulerUser } from "./types";

// --- Study load matrix (app.md §5.1, plan Objective 4.2) ---
//
// | Difficulty | Sessions |
// | 1–3        | 2–4      |
// | 4–7        | 5–8      |
// | 8–10       | 9–14     |
//
// The spec gives ranges; we interpolate linearly inside each band so the result
// is deterministic — the same exam always yields the same workload.

const BANDS: { min: number; max: number; low: number; high: number }[] = [
  { min: 1, max: 3, low: 2, high: 4 },
  { min: 4, max: 7, low: 5, high: 8 },
  { min: 8, max: 10, low: 9, high: 14 },
];

export function sessionsForDifficulty(difficulty: number): number {
  const d = Math.max(1, Math.min(10, Math.round(difficulty)));
  const band = BANDS.find((b) => d >= b.min && d <= b.max) ?? BANDS[1];

  const span = band.max - band.min;
  const ratio = span === 0 ? 0 : (d - band.min) / span;

  return band.low + Math.round(ratio * (band.high - band.low));
}

/** Collapse the nullable User columns into a fully-resolved settings object. */
export function resolveSettings(user: SchedulerUser): SchedulerSettings {
  const schoolEnd = user.schoolEndTime ?? "14:30";

  return {
    // Study starts once the student is home and the daily buffer (chores, dinner)
    // has been spent. Weekends have no school run, so they open at their own time.
    studyStartWeekday: user.arrivalHome ?? schoolEnd,
    studyStartWeekend: user.weekendStartTime ?? SCHEDULER_DEFAULTS.weekendStartTime,
    studyEnd: user.studyEndTime ?? "20:00",
    offDay: user.offDay ?? SCHEDULER_DEFAULTS.offDay,
    sessionMinutes: user.sessionMinutes ?? SCHEDULER_DEFAULTS.sessionMinutes,
    breakMinutes: user.breakMinutes ?? SCHEDULER_DEFAULTS.breakMinutes,
    maxSessionsPerDay: user.maxSessionsPerDay ?? SCHEDULER_DEFAULTS.maxSessionsPerDay,
    maxSubjectsPerDay: user.maxSubjectsPerDay ?? SCHEDULER_DEFAULTS.maxSubjectsPerDay,
    spacingOffsets: parseSpacingOffsets(user.spacingOffsets),
  };
}

/** The buffer only applies on school days — it models the gap between arriving home and settling down. */
export function bufferFor(user: SchedulerUser, dayOfWeek: number): number {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  return isWeekend ? 0 : (user.dailyBuffer ?? 0);
}
