import type { SessionType } from "@/lib/types";

// The engine is deliberately Prisma-free: callers hand it plain objects and get
// plain objects back. That keeps it pure, cheap to reason about, and verifiable
// by scripts/scheduler-check.ts without a test framework.

/** The subset of the User row the engine reads. Every field is nullable — see SCHEDULER_DEFAULTS. */
export interface SchedulerUser {
  schoolEndTime?: string | null;
  arrivalHome?: string | null;
  studyEndTime?: string | null;
  dailyBuffer?: number | null;
  offDay?: number | null;
  sessionMinutes?: number | null;
  breakMinutes?: number | null;
  maxSessionsPerDay?: number | null;
  maxSubjectsPerDay?: number | null;
  weekendStartTime?: string | null;
  spacingOffsets?: string | null;
}

/** Resolved settings, with every default already applied. */
export interface SchedulerSettings {
  studyStartWeekday: string;
  studyStartWeekend: string;
  studyEnd: string;
  offDay: number;
  sessionMinutes: number;
  breakMinutes: number;
  maxSessionsPerDay: number;
  maxSubjectsPerDay: number;
  spacingOffsets: number[];
}

export interface SchedulerTest {
  id: string;
  subjectId: string;
  date: Date;
  difficulty: number;
  prepDays: number;
}

/** A recurring extramural (dayOfWeek) or a once-off event (date). */
export interface BusyBlock {
  dayOfWeek?: number | null;
  date?: Date | null;
  startTime: string;
  endTime: string;
}

/** One rehearsal the spacing model asks for, before it has been given a time. */
export interface SessionDemand {
  testId: string;
  subjectId: string;
  /** The date the spacing curve wants. Placement may shift it if the day is full. */
  preferredDate: Date;
  /** Inclusive bounds the demand may be moved within. */
  earliestDate: Date;
  latestDate: Date;
  type: SessionType;
}

/** A session already on the calendar that must be planned around rather than re-derived. */
export interface ExistingSession {
  testId: string;
  date: Date;
  startTime: string;
  duration: number;
}

export interface GeneratedSession {
  testId: string;
  subjectId: string;
  date: Date;
  startTime: string;
  duration: number;
  type: SessionType;
}

export interface ScheduleResult {
  sessions: GeneratedSession[];
  /** Demands that found no free slot anywhere in their prep window. */
  unplaced: SessionDemand[];
  settings: SchedulerSettings;
}
