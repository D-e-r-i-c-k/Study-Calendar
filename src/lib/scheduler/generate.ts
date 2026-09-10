import { addDays, differenceInCalendarDays, format, startOfDay } from "date-fns";
import { computeDaySlots } from "./availability";
import { resolveSettings } from "./load";
import { buildDemands } from "./spacing";
import { overlaps, toMinutes } from "./time";
import type {
  BusyBlock,
  ExistingSession,
  GeneratedSession,
  ScheduleResult,
  SchedulerTest,
  SchedulerUser,
  SessionDemand,
} from "./types";

// --- Session instantiation (app.md §5.4 + §15, plan Objective 4.3) ---
//
//   generateSchedule(user, tests, availability) => StudySession[]
//
// Demands come out of the spacing model already carrying the date they *want*.
// This module decides which of those wishes the calendar can actually honour,
// under the allocation rules:
//
//   - never exceed the daily session ceiling;
//   - never exceed the daily subject ceiling (2-3 subjects, per the spec);
//   - interleave — no two adjacent slots on a day share a subject;
//   - a demand that will not fit slides to the nearest day with room, searching
//     earlier first so work is never deferred closer to the exam than planned,
//     and never past the exam itself.

export interface GenerateScheduleInput {
  user: SchedulerUser;
  tests: SchedulerTest[];
  busy: BusyBlock[];
  /**
   * Sessions already on the calendar that must survive — typically work the
   * student has completed. Their slots are treated as occupied, and each one
   * counts against its exam's required workload.
   */
  existing?: ExistingSession[];
  /** Schedule from this date forwards. Defaults to today. */
  from?: Date;
}

interface DayPlan {
  date: Date;
  slots: string[];
  assignments: (GeneratedSession | null)[];
}

export function generateSchedule({
  user,
  tests,
  busy,
  existing = [],
  from = new Date(),
}: GenerateScheduleInput): ScheduleResult {
  const settings = resolveSettings(user);
  const today = startOfDay(from);

  // Work that is already done blocks its slot and reduces what the curve still owes.
  const doneByTest = new Map<string, number>();
  for (const session of existing) {
    doneByTest.set(session.testId, (doneByTest.get(session.testId) ?? 0) + 1);
  }

  // Kept sessions were placed under whatever preferences were live at the time, so
  // they rarely sit on today's slot grid. Rather than letting them shift the whole
  // grid off its pitch, leave the grid intact and drop only the slots they cover.
  const occupied = existing.map((session) => ({
    day: format(session.date, "yyyy-MM-dd"),
    start: toMinutes(session.startTime),
    end: toMinutes(session.startTime) + session.duration,
  }));

  const demands = tests
    .flatMap((test) =>
      buildDemands(test, settings.spacingOffsets, today, doneByTest.get(test.id) ?? 0)
    )
    // Earlier wishes first; when two land on the same day, the nearer exam wins.
    .sort(
      (a, b) =>
        a.preferredDate.getTime() - b.preferredDate.getTime() ||
        a.latestDate.getTime() - b.latestDate.getTime()
    );

  const days = new Map<string, DayPlan>();
  const dayPlan = (date: Date): DayPlan => {
    const key = format(date, "yyyy-MM-dd");
    let plan = days.get(key);
    if (!plan) {
      const taken = occupied.filter((o) => o.day === key);
      const slots = computeDaySlots(user, settings, busy, date).filter(
        (slot) =>
          !taken.some((o) =>
            overlaps(toMinutes(slot), toMinutes(slot) + settings.sessionMinutes, o.start, o.end)
          )
      );
      plan = { date, slots, assignments: slots.map(() => null) };
      days.set(key, plan);
    }
    return plan;
  };

  const sessions: GeneratedSession[] = [];
  const unplaced: SessionDemand[] = [];

  for (const demand of demands) {
    const placed = place(demand, dayPlan, settings.maxSubjectsPerDay, settings.sessionMinutes);
    if (placed) sessions.push(placed);
    else unplaced.push(demand);
  }

  sessions.sort(
    (a, b) => a.date.getTime() - b.date.getTime() || a.startTime.localeCompare(b.startTime)
  );

  labelPasses(sessions);

  return { sessions, unplaced, settings };
}

/**
 * app.md §8 names three session kinds. Label them from where the sessions actually
 * landed rather than from where the spacing curve wished they would: if a rehearsal
 * overflows, the *remaining* last block before the exam is still the practice run.
 */
function labelPasses(sessions: GeneratedSession[]): void {
  const byTest = new Map<string, GeneratedSession[]>();
  for (const session of sessions) {
    const group = byTest.get(session.testId);
    if (group) group.push(session);
    else byTest.set(session.testId, [session]);
  }

  for (const group of byTest.values()) {
    group.forEach((session, index) => {
      session.type =
        index === 0 ? "learn" : index === group.length - 1 ? "practice" : "review";
    });
  }
}

/** Try the wished-for day, then walk outwards: earlier first, then later. */
function place(
  demand: SessionDemand,
  dayPlan: (date: Date) => DayPlan,
  maxSubjectsPerDay: number,
  sessionMinutes: number
): GeneratedSession | null {
  for (const date of candidateDates(demand)) {
    const plan = dayPlan(date);
    const slotIndex = findSlot(plan, demand.subjectId, maxSubjectsPerDay);
    if (slotIndex === -1) continue;

    const session: GeneratedSession = {
      testId: demand.testId,
      subjectId: demand.subjectId,
      date: plan.date,
      startTime: plan.slots[slotIndex],
      duration: sessionMinutes,
      type: demand.type,
    };
    plan.assignments[slotIndex] = session;
    return session;
  }

  return null;
}

function candidateDates(demand: SessionDemand): Date[] {
  const dates: Date[] = [demand.preferredDate];

  const backwards = differenceInCalendarDays(demand.preferredDate, demand.earliestDate);
  const forwards = differenceInCalendarDays(demand.latestDate, demand.preferredDate);

  // Earlier days first: pulling work forward is safe, pushing it later eats into
  // the gap before the exam that the spacing curve deliberately left.
  for (let i = 1; i <= backwards; i++) dates.push(addDays(demand.preferredDate, -i));
  for (let i = 1; i <= forwards; i++) dates.push(addDays(demand.preferredDate, i));

  return dates;
}

/**
 * The first free slot that keeps the day legal: within the subject ceiling, and
 * not adjacent to another session on the same subject (forced interleaving).
 *
 * Adjacency is measured between *sessions*, not slots — an empty slot in between
 * still reads as "two maths blocks in a row" to the student, so a gap does not
 * license a repeat.
 */
function findSlot(plan: DayPlan, subjectId: string, maxSubjectsPerDay: number): number {
  const subjectsToday = new Set(
    plan.assignments.filter((a): a is GeneratedSession => a !== null).map((a) => a.subjectId)
  );

  if (!subjectsToday.has(subjectId) && subjectsToday.size >= maxSubjectsPerDay) return -1;

  for (let i = 0; i < plan.assignments.length; i++) {
    if (plan.assignments[i] !== null) continue;
    if (nearestOccupied(plan, i, -1)?.subjectId === subjectId) continue;
    if (nearestOccupied(plan, i, 1)?.subjectId === subjectId) continue;
    return i;
  }

  return -1;
}

function nearestOccupied(plan: DayPlan, from: number, step: -1 | 1): GeneratedSession | null {
  for (let i = from + step; i >= 0 && i < plan.assignments.length; i += step) {
    const session = plan.assignments[i];
    if (session) return session;
  }
  return null;
}
