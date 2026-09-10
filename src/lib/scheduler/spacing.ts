import { differenceInCalendarDays, eachDayOfInterval, isSameDay, startOfDay, subDays } from "date-fns";
import type { SessionType } from "@/lib/types";
import { sessionsForDifficulty } from "./load";
import type { SchedulerTest, SessionDemand } from "./types";

// --- Spaced repetition ruleset (app.md §5.2, plan Objective 4.2) ---
//
// Difficulty decides *how many* rehearsals an exam needs; the spacing curve
// decides *when* they should fall. Offsets count backwards from the exam date
// (default 1, 2, 4, 7, 10), clamped into the prep window. Anything the curve
// cannot absorb spreads evenly across the remaining prep days.

export function buildDemands(
  test: SchedulerTest,
  offsets: number[],
  from: Date,
  /** Sessions for this exam the student has already ticked off — the curve owes that many fewer. */
  alreadyCompleted = 0
): SessionDemand[] {
  const today = startOfDay(from);
  const testDay = startOfDay(new Date(test.date));

  // Study happens strictly before the exam.
  const latest = subDays(testDay, 1);
  if (differenceInCalendarDays(latest, today) < 0) return [];

  const windowOpen = subDays(testDay, Math.max(1, test.prepDays));
  const earliest = differenceInCalendarDays(windowOpen, today) > 0 ? windowOpen : today;
  if (differenceInCalendarDays(latest, earliest) < 0) return [];

  const required = Math.max(0, sessionsForDifficulty(test.difficulty) - alreadyCompleted);
  if (required === 0) return [];

  const dates = pickDates(earliest, latest, testDay, required, offsets);

  return dates.map((date, index) => ({
    testId: test.id,
    subjectId: test.subjectId,
    preferredDate: date,
    earliestDate: earliest,
    latestDate: latest,
    type: typeForPass(index, dates.length),
  }));
}

/**
 * app.md §8 names three session kinds. The first pass introduces the material,
 * the last rehearses under exam conditions, everything between is review.
 */
function typeForPass(index: number, total: number): SessionType {
  if (index === 0) return "learn";
  if (index === total - 1) return "practice";
  return "review";
}

function pickDates(
  earliest: Date,
  latest: Date,
  testDay: Date,
  count: number,
  offsets: number[]
): Date[] {
  const window = eachDayOfInterval({ start: earliest, end: latest });
  if (window.length === 0 || count <= 0) return [];

  const chosen: Date[] = [];
  const claim = (date: Date) => {
    if (chosen.length < count && !chosen.some((d) => isSameDay(d, date))) {
      chosen.push(date);
    }
  };

  // 1. Anchor on the spacing curve, furthest offset first so passes run forwards in time.
  for (const offset of [...offsets].sort((a, b) => b - a)) {
    const candidate = subDays(testDay, offset);
    if (window.some((d) => isSameDay(d, candidate))) claim(candidate);
  }

  // 2. Spread any surplus evenly over the days the curve did not claim.
  const unused = window.filter((d) => !chosen.some((c) => isSameDay(c, d)));
  const spread = Math.min(count - chosen.length, unused.length);
  for (let i = 0; i < spread; i++) {
    claim(unused[Math.floor((i * unused.length) / spread)]);
  }

  // 3. A very short prep window can hold fewer days than the exam demands passes.
  //    Double up, cycling through the window so the load stays even.
  let cycle = 0;
  while (chosen.length < count) {
    chosen.push(window[cycle % window.length]);
    cycle++;
  }

  return chosen.sort((a, b) => a.getTime() - b.getTime());
}
