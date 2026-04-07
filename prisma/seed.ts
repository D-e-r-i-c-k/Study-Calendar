import { PrismaClient } from "@prisma/client";
import { subjects, tests, extramurals, sessions } from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning Database...");
  await prisma.studySession.deleteMany();
  await prisma.test.deleteMany();
  await prisma.extramural.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  console.log("Created Default User...");
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

  console.log("Seeding Subjects...");
  const createdSubjects = await Promise.all(
    subjects.map((sub) =>
      prisma.subject.create({
        data: {
          id: sub.id,
          userId: user.id,
          name: sub.name,
          color: sub.color,
        },
      })
    )
  );

  console.log("Seeding Extramurals...");
  await Promise.all(
    extramurals.map((ex) =>
      prisma.extramural.create({
        data: {
          id: ex.id,
          userId: user.id,
          name: ex.name,
          dayOfWeek: ex.dayOfWeek,
          startTime: ex.startTime,
          endTime: ex.endTime,
          emoji: ex.emoji,
        },
      })
    )
  );

  console.log("Seeding Tests...");
  const createdTests = await Promise.all(
    tests.map((test) =>
      prisma.test.create({
        data: {
          id: test.id,
          subjectId: test.subjectId, // ensure subject exists
          name: test.name,
          date: new Date(test.date),
          difficulty: test.difficulty,
          prepDays: test.prepDays,
        },
      })
    )
  );

  console.log("Seeding Sessions...");
  await Promise.all(
    sessions.map((sess) =>
      prisma.studySession.create({
        data: {
          id: sess.id,
          testId: sess.testId,
          date: new Date(sess.date),
          startTime: sess.startTime,
          duration: sess.duration,
          type: sess.type,
          completed: sess.completed,
        },
      })
    )
  );

  console.log("Database Seed COMPLETE.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
