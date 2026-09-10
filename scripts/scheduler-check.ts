/**
 * Sanity check for the Phase 4 scheduling engine.
 *
 *   npx tsx scripts/scheduler-check.ts          against the live database
 *   npx tsx scripts/scheduler-check.ts --demo   against a built-in fixture
 *
 * This repo has no test runner, so this script stands in for one: it generates a
 * schedule without writing anything, prints it day by day, and asserts the
 * invariants from app.md §5.3-5.4. The --demo fixture exercises a busy week with
 * three exams of differing difficulty, so the engine can be checked even when the
 * developer's own database is empty.
 */
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { generateSchedule } from "../src/lib/scheduler/generate";
import { resolveSettings, sessionsForDifficulty, bufferFor } from "../src/lib/scheduler/load";
import { toMinutes, overlaps } from "../src/lib/scheduler/time";
import type { BusyBlock } from "../src/lib/scheduler/types";

const prisma = new PrismaClient();

const failures: string[] = [];
function check(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const USE_DEMO = process.argv.includes("--demo");

/** A deliberately crowded week: three exams, two extramurals and a once-off event. */
function demoFixture(todayStart: Date) {
  const day = (offset: number) => {
    const d = new Date(todayStart);
    d.setDate(d.getDate() + offset);
    return d;
  };

  return {
    user: {
      schoolEndTime: "14:30",
      arrivalHome: "15:00",
      studyEndTime: "20:00",
      dailyBuffer: 30,
      offDay: 0,
      sessionMinutes: 25,
      breakMinutes: 5,
      maxSessionsPerDay: 6,
      maxSubjectsPerDay: 3,
      weekendStartTime: "09:00",
      spacingOffsets: "1,2,4,7,10",
      extramurals: [
        { dayOfWeek: 1, startTime: "17:00", endTime: "18:00" },
        { dayOfWeek: 4, startTime: "17:00", endTime: "18:30" },
      ],
      events: [{ date: day(3), startTime: "16:00", endTime: "17:30" }],
    },
    tests: [
      { id: "d1", subjectId: "maths", subject: { name: "Mathematics" }, name: "Algebra", date: day(12), difficulty: 9, prepDays: 12 },
      { id: "d2", subjectId: "science", subject: { name: "Phys. Science" }, name: "Reactions", date: day(9), difficulty: 6, prepDays: 9 },
      { id: "d3", subjectId: "english", subject: { name: "English" }, name: "Poetry", date: day(6), difficulty: 3, prepDays: 6 },
    ],
  };
}

async function main() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const demo = USE_DEMO ? demoFixture(todayStart) : null;

  const dbUser = demo
    ? null
    : await prisma.user.findFirst({ include: { extramurals: true, events: true } });

  if (!demo && !dbUser) {
    throw new Error("No primary user found. Load / once, or run npx tsx prisma/seed.ts.");
  }

  const user = demo?.user ?? dbUser!;

  const tests =
    demo?.tests ??
    (await prisma.test.findMany({
      where: { subject: { userId: dbUser!.id }, date: { gte: todayStart } },
      include: { subject: true },
      orderBy: { date: "asc" },
    }));

  if (tests.length === 0) {
    console.log("No upcoming examinations — nothing to schedule.");
    console.log("File one on /examinations, or re-run with --demo to use the built-in fixture.");
    return;
  }

  const busy: BusyBlock[] = [
    ...user.extramurals.map((e) => ({ dayOfWeek: e.dayOfWeek, startTime: e.startTime, endTime: e.endTime })),
    ...user.events.map((e) => ({ date: e.date, startTime: e.startTime, endTime: e.endTime })),
  ];

  console.log(USE_DEMO ? "\nSOURCE  built-in demo fixture" : "\nSOURCE  live database");

  const settings = resolveSettings(user);
  const engineTests = tests.map((t) => ({
    id: t.id,
    subjectId: t.subjectId,
    date: t.date,
    difficulty: t.difficulty,
    prepDays: t.prepDays,
  }));

  // Work already ticked off, whenever it happened. The engine must count it
  // against the exam's outstanding load, or every rebuild re-demands sessions
  // the student has already sat.
  const completedSessions = demo
    ? []
    : await prisma.studySession.findMany({
        where: { completed: true },
        select: { testId: true, date: true, startTime: true, duration: true },
      });

  const { sessions, unplaced } = generateSchedule({
    user,
    tests: engineTests,
    busy,
    existing: completedSessions,
    from: todayStart,
  });

  const subjectName = new Map(tests.map((t) => [t.subjectId, t.subject.name]));
  const testById = new Map(tests.map((t) => [t.id, t]));

  // --- Report ---
  console.log("\nSETTINGS");
  console.log(`  window        ${settings.studyStartWeekday} (weekday) / ${settings.studyStartWeekend} (weekend) -> ${settings.studyEnd}`);
  console.log(`  buffer        ${user.dailyBuffer ?? 0}m on school days`);
  console.log(`  slot          ${settings.sessionMinutes}m focus + ${settings.breakMinutes}m break`);
  console.log(`  ceilings      ${settings.maxSessionsPerDay} sessions / ${settings.maxSubjectsPerDay} subjects a day`);
  console.log(`  rest day      ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][settings.offDay]}`);
  console.log(`  spacing       ${settings.spacingOffsets.join(", ")} days before the exam`);

  console.log("\nEXAMINATIONS");
  for (const t of tests) {
    const required = sessionsForDifficulty(t.difficulty);
    const got = sessions.filter((s) => s.testId === t.id).length;
    console.log(
      `  ${format(t.date, "yyyy-MM-dd")}  ${t.subject.name} / ${t.name}` +
        `  diff ${t.difficulty} -> ${required} sessions, scheduled ${got}`
    );
  }

  console.log("\nSCHEDULE");
  const byDay = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const key = format(s.date, "yyyy-MM-dd");
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(s);
  }
  for (const [day, daySessions] of [...byDay.entries()].sort()) {
    const label = format(new Date(day), "EEE dd MMM");
    const line = daySessions
      .map((s) => `${s.startTime} ${subjectName.get(s.subjectId) ?? "?"} (${s.type})`)
      .join("  |  ");
    console.log(`  ${label}  ${line}`);
  }
  if (sessions.length === 0) console.log("  (empty)");

  // --- Assertions ---
  // Unplaced demands are not a defect: they mean the prep window genuinely cannot
  // hold the workload under the interleaving and ceiling rules. The UI reports the
  // same number so the student can lengthen prep or raise the daily ceiling.
  if (unplaced.length > 0) {
    console.log("\nOVERFLOW");
    for (const d of unplaced) {
      console.log(
        `  ${subjectName.get(d.subjectId) ?? d.subjectId}: a session wanted around ` +
          `${format(d.preferredDate, "yyyy-MM-dd")} found no legal slot in its prep window`
      );
    }
  }

  for (const [day, daySessions] of byDay.entries()) {
    const date = new Date(day);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    check(dayOfWeek !== settings.offDay, `${day} is the rest day but holds ${daySessions.length} session(s)`);

    const open =
      toMinutes(isWeekend ? settings.studyStartWeekend : settings.studyStartWeekday) +
      bufferFor(user, dayOfWeek);
    const close = toMinutes(settings.studyEnd);

    check(
      daySessions.length <= settings.maxSessionsPerDay,
      `${day} holds ${daySessions.length} sessions, over the ceiling of ${settings.maxSessionsPerDay}`
    );

    const subjects = new Set(daySessions.map((s) => s.subjectId));
    check(
      subjects.size <= settings.maxSubjectsPerDay,
      `${day} spans ${subjects.size} subjects, over the ceiling of ${settings.maxSubjectsPerDay}`
    );

    const ordered = [...daySessions].sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 0; i < ordered.length; i++) {
      const s = ordered[i];
      const start = toMinutes(s.startTime);

      check(start >= open, `${day} ${s.startTime} starts before the study window opens (${open})`);
      check(start + s.duration <= close, `${day} ${s.startTime} runs past the study cutoff ${settings.studyEnd}`);

      for (const block of busy) {
        const applies = block.date
          ? format(new Date(block.date), "yyyy-MM-dd") === day
          : block.dayOfWeek === dayOfWeek;
        if (!applies) continue;
        check(
          !overlaps(start, start + s.duration, toMinutes(block.startTime), toMinutes(block.endTime)),
          `${day} ${s.startTime} collides with a commitment at ${block.startTime}-${block.endTime}`
        );
      }

      if (i > 0) {
        check(
          ordered[i - 1].subjectId !== s.subjectId,
          `${day} runs ${subjectName.get(s.subjectId)} back-to-back at ${ordered[i - 1].startTime} and ${s.startTime} (interleaving broken)`
        );
        check(
          toMinutes(ordered[i - 1].startTime) + ordered[i - 1].duration <= start,
          `${day} overlaps its own sessions at ${s.startTime}`
        );
      }

      const test = testById.get(s.testId)!;
      check(s.date < test.date, `${day} schedules a session on or after its exam (${format(test.date, "yyyy-MM-dd")})`);
    }
  }

  for (const t of tests) {
    const required = sessionsForDifficulty(t.difficulty);
    const got = sessions.filter((s) => s.testId === t.id).length;
    const done = completedSessions.filter((s) => s.testId === t.id).length;
    check(got <= required, `${t.name} got ${got} sessions but difficulty ${t.difficulty} calls for ${required}`);
    check(
      got + done <= required,
      `${t.name} got ${got} new sessions on top of ${done} already completed, over the ${required} its difficulty calls for`
    );
  }

  for (const s of sessions) {
    check(s.date >= todayStart, `a session was placed in the past (${format(s.date, "yyyy-MM-dd")})`);
  }

  // --- Regression guard: completed work must discharge the workload ---
  //
  // regenerateSchedule once bounded its "completed" query to today onwards, so
  // sessions sat yesterday never reached the engine and were demanded all over
  // again — the outstanding load crept up every day. Pin the behaviour here.
  {
    const subject = engineTests[0];
    const alreadyDone = [
      {
        testId: subject.id,
        date: new Date(todayStart.getTime() - 3 * 24 * 60 * 60 * 1000),
        startTime: "15:30",
        duration: settings.sessionMinutes,
      },
      {
        testId: subject.id,
        date: new Date(todayStart.getTime() - 2 * 24 * 60 * 60 * 1000),
        startTime: "15:30",
        duration: settings.sessionMinutes,
      },
    ];

    const baseline = generateSchedule({ user, tests: engineTests, busy, from: todayStart });
    const discounted = generateSchedule({
      user,
      tests: engineTests,
      busy,
      existing: alreadyDone,
      from: todayStart,
    });

    // Count total demand, not placed sessions: when a prep window is already
    // saturated, discounting the workload converts overflow into placements
    // rather than reducing the number of blocks on the calendar.
    const demandFor = (r: typeof baseline) =>
      r.sessions.filter((s) => s.testId === subject.id).length +
      r.unplaced.filter((d) => d.testId === subject.id).length;

    const before = demandFor(baseline);
    const after = demandFor(discounted);

    check(
      before - after === alreadyDone.length,
      `two sessions completed in the past should reduce the demand by exactly 2, but it went ${before} -> ${after}`
    );
    check(
      discounted.sessions.every((s) => s.date >= todayStart),
      "past completed work must not drag new sessions into the past"
    );
  }

  console.log("");
  if (failures.length === 0) {
    const overflow = unplaced.length > 0 ? ` (${unplaced.length} demand(s) overflowed — see above)` : "";
    console.log(`PASS — ${sessions.length} sessions across ${byDay.size} days, all invariants hold.${overflow}`);
  } else {
    console.log(`FAIL — ${failures.length} problem(s):`);
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
