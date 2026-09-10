"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { subjects, tests, extramurals } from "@/lib/mock-data";
import { eventSchema } from "@/lib/validations";
import { generateSchedule } from "@/lib/scheduler/generate";
import type { BusyBlock } from "@/lib/scheduler/types";

export async function ensureSeeded() {
  const userCount = await prisma.user.count();
  if (userCount > 0) return;

  console.log("Seeding initial data...");

  // Create default user to anchor everything to
  const user = await prisma.user.create({
    data: {
      name: "Default Editor",
      grade: "11",
      curriculum: "IEB",
      school: "Example High",
      schoolEndTime: "14:30",
      arrivalHome: "15:00",
      studyEndTime: "18:00",
      dailyBuffer: 30,
      offDay: 0,
      tz: "UTC",
    },
  });

  // Seed Subjects
  for (const sub of subjects) {
    await prisma.subject.create({
      data: {
        id: sub.id,
        userId: user.id,
        name: sub.name,
        color: sub.color,
      },
    });
  }

  // Seed Extramurals
  for (const ex of extramurals) {
    await prisma.extramural.create({
      data: {
        id: ex.id,
        userId: user.id,
        name: ex.name,
        dayOfWeek: ex.dayOfWeek,
        startTime: ex.startTime,
        endTime: ex.endTime,
        emoji: ex.emoji || null,
      },
    });
  }

  // Seed Tests
  for (const test of tests) {
    await prisma.test.create({
      data: {
        id: test.id,
        subjectId: test.subjectId,
        name: test.name,
        date: new Date(test.date),
        difficulty: test.difficulty,
        prepDays: test.prepDays,
      },
    });
  }

  // Study sessions are no longer seeded from mock data — the Phase 4 engine
  // produces them. Hit "Generate Schedule" on the dashboard to populate the
  // calendar from the seeded subjects and examinations.

  console.log("Seeding complete.");
}

export async function toggleSessionCompletion(sessionId: string, completed: boolean) {
  await prisma.studySession.update({
    where: { id: sessionId },
    // Stamping the moment it was ticked is what lets the streak measure days the
    // student actually studied rather than days the plan happened to be fulfilled.
    // Un-ticking clears it so a mistaken tick leaves no trace.
    data: { completed, completedAt: completed ? new Date() : null },
  });
}

// --- Automatic recalculation (Phase 5, app.md §7) ---

/**
 * Wraps a mutation that changes what the scheduling engine sees, rebuilding the
 * schedule around it so the calendar never lags the facts.
 *
 * The write lands first and is never rolled back by a scheduling failure: a
 * student's saved examination matters more than an up-to-date calendar, and the
 * Generate Schedule button remains as the manual retry. Regeneration is
 * idempotent — it rebuilds future uncompleted work deterministically from the
 * same inputs — so running it after every mutation is safe.
 *
 * This is the one place in this file that invalidates a cache, and it is a
 * narrow, deliberate exception to the convention that actions here leave that
 * to their callers (CLAUDE.md). It has to be: the caller is standing on
 * /examinations or /preferences, and `router.refresh()` can only refresh the
 * route it is on — never the dashboard whose schedule just changed. The
 * dashboard is prerendered, so without this the rebuilt calendar would never
 * surface. Every other action in this file still revalidates nothing.
 */
async function withRecalculation<T>(mutate: () => Promise<T>): Promise<T> {
  const result = await mutate();

  try {
    await regenerateSchedule();
  } catch (error) {
    console.error("Automatic recalculation failed; schedule left as it was.", error);
  }

  // The mutation landed either way, so the dashboard is stale regardless of
  // whether the rebuild above succeeded.
  revalidatePath("/");

  return result;
}

// --- Management Mutations ---

export async function createSubject(data: { name: string; color: string }) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No primary user found.");

  return await prisma.subject.create({
    data: {
      userId: user.id,
      name: data.name,
      color: data.color,
    },
  });
}

export async function updateSubject(id: string, data: { name?: string; color?: string }) {
  return await prisma.subject.update({
    where: { id },
    data,
  });
}

export async function deleteSubject(id: string) {
  // Cascades to the subject's tests and their sessions, freeing slots.
  return await withRecalculation(() =>
    prisma.subject.delete({
      where: { id },
    })
  );
}

export async function createExamination(data: {
  subjectId: string;
  name: string;
  date: Date;
  difficulty: number;
  prepDays: number;
}) {
  return await withRecalculation(() =>
    prisma.test.create({
      data,
    })
  );
}

export async function updateExamination(
  id: string,
  data: {
    subjectId?: string;
    name?: string;
    date?: Date;
    difficulty?: number;
    prepDays?: number;
  }
) {
  return await withRecalculation(() =>
    prisma.test.update({
      where: { id },
      data,
    })
  );
}

export async function deleteExamination(id: string) {
  // Cascades through to the test's StudySession rows.
  return await withRecalculation(() =>
    prisma.test.delete({
      where: { id },
    })
  );
}

export async function updateUserProfile(data: any) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No primary user found.");

  // Study window, buffer, rest day and the engine's ceilings all live here.
  return await withRecalculation(() =>
    prisma.user.update({
      where: { id: user.id },
      data,
    })
  );
}

export async function createExtramural(data: {
  name: string;
  days: number[];
  startTime: string;
  endTime: string;
  emoji?: string;
}) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No primary user found.");

  // Iterate array of days to generate dedicated recurring SQLite entries
  const creations = data.days.map((dayOfWeek) => 
    prisma.extramural.create({
      data: {
        userId: user.id,
        name: data.name,
        dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        emoji: data.emoji || "📅",
      }
    })
  );

  return await withRecalculation(() => Promise.all(creations));
}

export async function deleteExtramural(id: string) {
  return await withRecalculation(() =>
    prisma.extramural.delete({
      where: { id },
    })
  );
}

export async function updateTestResult(id: string, result: string | null) {
  return await prisma.test.update({
    where: { id },
    data: { result },
  });
}

export async function createEvent(data: {
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  emoji?: string;
}) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No primary user found.");

  const parsed = eventSchema.parse(data);

  return await withRecalculation(() =>
    prisma.event.create({
      data: {
        userId: user.id,
        name: parsed.name,
        date: parsed.date,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        emoji: parsed.emoji || "📅",
      },
    })
  );
}

export async function deleteEvent(id: string) {
  return await withRecalculation(() =>
    prisma.event.delete({
      where: { id },
    })
  );
}


// --- Scheduling Engine ---

export interface RegenerateSummary {
  created: number;
  removed: number;
  unplaced: number;
  daysCovered: number;
  preserved: number;
}

/**
 * Rebuild every future study session from the current exams, availability and
 * preferences (Phase 4). Completed work and anything already in the past is left
 * untouched, so the historical log survives a regeneration.
 */
export async function regenerateSchedule(): Promise<RegenerateSummary> {
  const user = await prisma.user.findFirst({
    include: { extramurals: true, events: true },
  });
  if (!user) throw new Error("No primary user found.");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const upcomingTests = await prisma.test.findMany({
    where: {
      subject: { userId: user.id },
      date: { gte: todayStart },
    },
    select: { id: true, subjectId: true, date: true, difficulty: true, prepDays: true },
    // Explicit ordering matters: generate.ts breaks demand ties by array order,
    // so without this the rebuild would only be deterministic by accident.
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });

  const busy: BusyBlock[] = [
    ...user.extramurals.map((e) => ({
      dayOfWeek: e.dayOfWeek,
      startTime: e.startTime,
      endTime: e.endTime,
    })),
    ...user.events.map((e) => ({
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
    })),
  ];

  // Completed sessions stay put. The engine plans around them: their slots are
  // off limits, and each one counts against its exam's remaining workload.
  //
  // Deliberately unbounded by date. Work finished *yesterday* still discharges
  // part of an exam's workload, so bounding this to today would re-demand every
  // session the student has already sat — the remaining load would inflate a
  // little more each day. Past rows can never steal a slot: buildDemands clamps
  // its window to today, so they only ever contribute to the count.
  const completed = await prisma.studySession.findMany({
    where: { completed: true },
    select: { testId: true, date: true, startTime: true, duration: true },
  });

  // "Preserved" in the summary means work kept on the *future* calendar — the
  // number the student sees reported back after a rebuild.
  const preserved = completed.filter((s) => s.date >= todayStart);

  const removed = await prisma.studySession.deleteMany({
    where: { date: { gte: todayStart }, completed: false },
  });

  const { sessions, unplaced } = generateSchedule({
    user,
    tests: upcomingTests,
    busy,
    existing: completed,
    from: todayStart,
  });

  if (sessions.length > 0) {
    await prisma.studySession.createMany({
      data: sessions.map((s) => ({
        testId: s.testId,
        date: s.date,
        startTime: s.startTime,
        duration: s.duration,
        type: s.type,
      })),
    });
  }

  const daysCovered = new Set(sessions.map((s) => s.date.toDateString())).size;

  return {
    created: sessions.length,
    removed: removed.count,
    unplaced: unplaced.length,
    daysCovered,
    preserved: preserved.length,
  };
}

// --- Review debt (Phase 5, Objective 5.2) ---

export interface ReviewDebtSummary {
  /** Missed sessions cleared from the past and re-demanded in the remaining prep window. */
  carried: number;
  /** Missed sessions whose examination has already been sat — left alone as history. */
  stranded: number;
}

/**
 * Fold missed work back into the plan.
 *
 * `regenerateSchedule()` only ever touches today forwards, so uncompleted
 * sessions in the past just sit there: the calendar shows work that can no
 * longer be done, and the plan quietly loses it. This clears those rows for
 * examinations that are still ahead and regenerates — the engine derives each
 * exam's outstanding load as `sessionsForDifficulty(difficulty) - completed`,
 * so deleting a never-completed session is exactly what makes the engine ask
 * for it again, this time inside the window that is left. The cascade *is* the
 * existing engine; no second placement path exists to drift out of sync.
 *
 * Sessions for examinations already sat are deliberately kept. They are the
 * honest record of what was skipped, they should drag the completion ratio
 * down, and they feed the weak-subject signal.
 *
 * Idempotent — once carried, there is nothing left to find, so it is safe to
 * call on every dashboard render.
 */
let debtInFlight: Promise<ReviewDebtSummary> | null = null;

export async function carryReviewDebt(): Promise<ReviewDebtSummary> {
  // Two dashboard renders in flight at once could both pass the guard below and
  // cascade the same debt twice. Sharing one promise makes the pass single-file.
  debtInFlight ??= runReviewDebt().finally(() => {
    debtInFlight = null;
  });

  return debtInFlight;
}

async function runReviewDebt(): Promise<ReviewDebtSummary> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const missed = await prisma.studySession.findMany({
    where: { date: { lt: todayStart }, completed: false },
    select: { id: true, test: { select: { date: true } } },
  });

  if (missed.length === 0) return { carried: 0, stranded: 0 };

  const recoverable = missed.filter((session) => session.test.date >= todayStart);
  const stranded = missed.length - recoverable.length;

  if (recoverable.length === 0) return { carried: 0, stranded };

  await prisma.studySession.deleteMany({
    where: { id: { in: recoverable.map((session) => session.id) } },
  });

  await regenerateSchedule();

  return { carried: recoverable.length, stranded };
}
