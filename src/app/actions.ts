"use server";

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
    data: { completed },
  });
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
  return await prisma.subject.delete({
    where: { id },
  });
}

export async function createExamination(data: {
  subjectId: string;
  name: string;
  date: Date;
  difficulty: number;
  prepDays: number;
}) {
  return await prisma.test.create({
    data,
  });
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
  return await prisma.test.update({
    where: { id },
    data,
  });
}

export async function deleteExamination(id: string) {
  // Cascades through to the test's StudySession rows.
  return await prisma.test.delete({
    where: { id },
  });
}

export async function updateUserProfile(data: any) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No primary user found.");

  return await prisma.user.update({
    where: { id: user.id },
    data,
  });
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

  return await Promise.all(creations);
}

export async function deleteExtramural(id: string) {
  return await prisma.extramural.delete({
    where: { id },
  });
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

  return await prisma.event.create({
    data: {
      userId: user.id,
      name: parsed.name,
      date: parsed.date,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      emoji: parsed.emoji || "📅",
    },
  });
}

export async function deleteEvent(id: string) {
  return await prisma.event.delete({
    where: { id },
  });
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
  const preserved = await prisma.studySession.findMany({
    where: { date: { gte: todayStart }, completed: true },
    select: { testId: true, date: true, startTime: true, duration: true },
  });

  const removed = await prisma.studySession.deleteMany({
    where: { date: { gte: todayStart }, completed: false },
  });

  const { sessions, unplaced } = generateSchedule({
    user,
    tests: upcomingTests,
    busy,
    existing: preserved,
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
