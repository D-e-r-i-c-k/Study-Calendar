import {
  differenceInCalendarDays,
  endOfWeek,
  isSameDay,
  startOfDay,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";
import type { SessionType } from "./types";

// --- Live insight aggregates (plan Objective 5.3) ---
//
// Deliberately Prisma-free, mirroring src/lib/scheduler/: plain rows in, plain
// numbers out. That keeps the reasoning testable by scripts/stats-check.ts
// without a database, which is how this repo stands in for a test suite.
//
// The week runs Sunday-to-Saturday to match weekStartsOn: 0 used everywhere in
// the calendar (CalendarManager.tsx, MonthGrid.tsx). All arithmetic is on
// server-local time via date-fns, consistent with the rest of the app.

const WEEK_OPTIONS = { weekStartsOn: 0 } as const;

/** A completion ratio below this, over a meaningful sample, marks a subject weak. */
const WEAK_THRESHOLD = 0.6;

/** Fewer due sessions than this and a subject has not earned a verdict either way. */
const WEAK_MIN_SAMPLE = 3;

/** The flat shape the stats read. Callers map their Prisma rows onto this once. */
export interface StatSession {
  id: string;
  testId: string;
  testName: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  date: Date;
  startTime: string;
  type: SessionType;
  completed: boolean;
  completedAt: Date | null;
}

export interface WeeklyFigures {
  sessionsCompleted: number;
  sessionsTotal: number;
  completionRate: number;
  /** This week's rate minus last week's, in points. Negative when slipping. */
  completionDelta: number;
}

export interface SubjectStanding {
  subject: { id: string; name: string; color: string };
  percentage: number;
  completed: number;
  total: number;
  isWeak: boolean;
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  done: boolean;
}

export interface StreakSummary {
  /** Consecutive days studied, counting back from today. */
  current: number;
  /** True once today itself has a completed session. */
  studiedToday: boolean;
}

/**
 * Sessions are only counted once they have fallen due. Crediting a completion
 * ratio against work that is not yet scheduled to happen would show the student
 * failing every Sunday and recovering by Saturday.
 */
function dueBy(sessions: StatSession[], from: Date, to: Date, now: Date): StatSession[] {
  const cutoff = to < now ? to : now;
  return sessions.filter((s) => s.date >= from && s.date <= cutoff);
}

function ratio(sessions: StatSession[]): number {
  if (sessions.length === 0) return 0;
  return sessions.filter((s) => s.completed).length / sessions.length;
}

export function weeklyFigures(sessions: StatSession[], now: Date): WeeklyFigures {
  const thisWeekStart = startOfWeek(now, WEEK_OPTIONS);
  const thisWeekEnd = endOfWeek(now, WEEK_OPTIONS);
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  const lastWeekEnd = subWeeks(thisWeekEnd, 1);

  const thisWeek = dueBy(sessions, thisWeekStart, thisWeekEnd, now);
  const lastWeek = dueBy(sessions, lastWeekStart, lastWeekEnd, now);

  const rate = Math.round(ratio(thisWeek) * 100);
  const previous = Math.round(ratio(lastWeek) * 100);

  return {
    sessionsCompleted: thisWeek.filter((s) => s.completed).length,
    sessionsTotal: thisWeek.length,
    completionRate: rate,
    // With no prior week to compare against, report no movement rather than a
    // fictitious jump from zero.
    completionDelta: lastWeek.length === 0 ? 0 : rate - previous,
  };
}

/**
 * Per-subject standing, measured over work that has actually fallen due. A
 * subject is weak when it has a real sample behind it and still sits under the
 * threshold — one missed session should not brand a subject.
 */
export function subjectStanding(sessions: StatSession[], now: Date): SubjectStanding[] {
  const due = sessions.filter((s) => s.date <= now);

  const bySubject = new Map<string, StatSession[]>();
  for (const session of due) {
    const group = bySubject.get(session.subjectId);
    if (group) group.push(session);
    else bySubject.set(session.subjectId, [session]);
  }

  return [...bySubject.values()]
    .map((group) => {
      const completed = group.filter((s) => s.completed).length;
      const percentage = Math.round((completed / group.length) * 100);

      return {
        subject: {
          id: group[0].subjectId,
          name: group[0].subjectName,
          color: group[0].subjectColor,
        },
        percentage,
        completed,
        total: group.length,
        isWeak: group.length >= WEAK_MIN_SAMPLE && completed / group.length < WEAK_THRESHOLD,
      };
    })
    .sort((a, b) => b.percentage - a.percentage || a.subject.name.localeCompare(b.subject.name));
}

const TYPE_SUBTITLES: Record<SessionType, string> = {
  learn: "New Learning",
  review: "Review",
  practice: "Practice Test",
};

export function todayAgenda(sessions: StatSession[], now: Date): AgendaItem[] {
  return sessions
    .filter((s) => isSameDay(s.date, now))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((s) => ({
      id: s.id,
      time: s.startTime,
      title: s.testName,
      subtitle: TYPE_SUBTITLES[s.type] ?? s.type,
      done: s.completed,
    }));
}

/**
 * Consecutive days studied, walking back from today. Each day is one of:
 *
 *   done    — at least one session was ticked off on that day;
 *   neutral — the rest day, or a day with nothing scheduled;
 *   broken  — work was scheduled and none of it was done.
 *
 * Neutral days are stepped over rather than counted, so a rest day does not end
 * a streak and an empty day does not inflate one. Today is treated as neutral
 * while it is still untouched: the streak should not appear to collapse at
 * breakfast, before the student has had a chance to study.
 *
 * This reads `completedAt`, not `date` — the streak measures days work was
 * actually done, so back-ticking last week's session cannot rewrite history.
 */
export function studyStreak(
  sessions: StatSession[],
  offDay: number,
  now: Date
): StreakSummary {
  const today = startOfDay(now);

  const scheduledOn = new Set(sessions.map((s) => startOfDay(s.date).getTime()));
  const studiedOn = new Set(
    sessions
      .filter((s) => s.completed && s.completedAt)
      .map((s) => startOfDay(s.completedAt!).getTime())
  );

  const studiedToday = studiedOn.has(today.getTime());

  // Nothing has ever been completed — there is no streak to walk back through.
  if (studiedOn.size === 0) return { current: 0, studiedToday: false };

  const earliest = Math.min(...studiedOn);
  const horizon = differenceInCalendarDays(today, startOfDay(new Date(earliest)));

  let current = 0;

  for (let offset = 0; offset <= horizon; offset++) {
    const day = subDays(today, offset);
    const key = day.getTime();

    if (studiedOn.has(key)) {
      current++;
      continue;
    }

    // The rest day and days with no work scheduled are simply skipped.
    if (day.getDay() === offDay || !scheduledOn.has(key)) continue;

    // Today counts as untouched rather than missed until it is over.
    if (offset === 0) continue;

    break;
  }

  return { current, studiedToday };
}
