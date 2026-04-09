"use server";

import { prisma } from "@/lib/db";
import { subjects, tests, extramurals, sessions } from "@/lib/mock-data";

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
      offDay: 0, // Sunday
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

  // Seed Sessions
  for (const sess of sessions) {
    await prisma.studySession.create({
      data: {
        id: sess.id,
        testId: sess.testId,
        date: new Date(sess.date),
        startTime: sess.startTime,
        duration: sess.duration,
        type: sess.type,
        completed: sess.completed,
      },
    });
  }

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

export async function updateUserProfile(data: any) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No primary user found.");

  return await prisma.user.update({
    where: { id: user.id },
    data,
  });
}
