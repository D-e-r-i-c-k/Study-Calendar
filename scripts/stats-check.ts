/**
 * Sanity check for the Phase 5 insight aggregates.
 *
 *   npx tsx scripts/stats-check.ts
 *
 * This repo has no test runner, so this script stands in for one — the same
 * hand-rolled shape as scripts/scheduler-check.ts. It works entirely on
 * fixtures (src/lib/stats.ts is Prisma-free) and writes nothing, so it is safe
 * to run at any time and gives the same answer on any machine.
 */
import { addDays, format, startOfWeek, subDays, subWeeks } from "date-fns";
import {
  studyStreak,
  subjectStanding,
  todayAgenda,
  weeklyFigures,
  type StatSession,
} from "../src/lib/stats";

const failures: string[] = [];
function check(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

/** Fixed "now" so the fixtures never drift with the real calendar. */
const NOW = new Date(2026, 8, 10, 14, 0, 0); // Thu 10 Sep 2026
const OFF_DAY = 0; // Sunday

let seq = 0;
function session(
  date: Date,
  subject: string,
  completed: boolean,
  completedAt: Date | null = completed ? date : null,
  startTime = "15:30"
): StatSession {
  seq++;
  return {
    id: `s${seq}`,
    testId: `t-${subject}`,
    testName: `${subject} paper`,
    subjectId: subject,
    subjectName: subject,
    subjectColor: "rust",
    date,
    startTime,
    type: "review",
    completed,
    completedAt,
  };
}

// --- Weekly figures ---
{
  const thisWeek = startOfWeek(NOW, { weekStartsOn: 0 }); // Sun 6 Sep
  const lastWeek = subWeeks(thisWeek, 1);

  const sessions = [
    // This week, all due by Thursday: 3 of 4 done => 75%.
    session(addDays(thisWeek, 1), "maths", true),
    session(addDays(thisWeek, 2), "maths", true),
    session(addDays(thisWeek, 3), "english", true),
    session(addDays(thisWeek, 4), "english", false),
    // Not yet due — must not count against the rate.
    session(addDays(thisWeek, 6), "maths", false),
    // Last week: 1 of 2 done => 50%.
    session(addDays(lastWeek, 1), "maths", true),
    session(addDays(lastWeek, 2), "maths", false),
  ];

  const figures = weeklyFigures(sessions, NOW);
  check(figures.sessionsTotal === 4, `weekly total counted ${figures.sessionsTotal}, expected 4 (future work must not count)`);
  check(figures.sessionsCompleted === 3, `weekly completed counted ${figures.sessionsCompleted}, expected 3`);
  check(figures.completionRate === 75, `weekly rate was ${figures.completionRate}%, expected 75%`);
  check(figures.completionDelta === 25, `weekly delta was ${figures.completionDelta}, expected +25`);

  // A worse week than the last must report a negative delta.
  const slipping = [
    session(addDays(thisWeek, 1), "maths", false),
    session(addDays(thisWeek, 2), "maths", false),
    session(addDays(lastWeek, 1), "maths", true),
    session(addDays(lastWeek, 2), "maths", true),
  ];
  check(weeklyFigures(slipping, NOW).completionDelta === -100, "a fully missed week after a perfect one must report -100");

  // With no prior week, report no movement rather than a jump from zero.
  const firstWeek = [session(addDays(thisWeek, 1), "maths", true)];
  check(weeklyFigures(firstWeek, NOW).completionDelta === 0, "delta must be 0 when there is no previous week to compare");
}

// --- Subject standing and the weak-subject signal ---
{
  const sessions = [
    // maths: 2 of 6 done => 33%, a real sample => weak.
    ...Array.from({ length: 2 }, (_, i) => session(subDays(NOW, i + 1), "maths", true)),
    ...Array.from({ length: 4 }, (_, i) => session(subDays(NOW, i + 3), "maths", false)),
    // english: 1 of 2 done => 50%, but too small a sample to call weak.
    session(subDays(NOW, 1), "english", true),
    session(subDays(NOW, 2), "english", false),
    // history: 3 of 3 done => 100%.
    ...Array.from({ length: 3 }, (_, i) => session(subDays(NOW, i + 1), "history", true)),
  ];

  const standing = subjectStanding(sessions, NOW);
  const by = (id: string) => standing.find((s) => s.subject.id === id)!;

  check(standing.length === 3, `expected 3 subjects, got ${standing.length}`);
  check(by("maths").percentage === 33, `maths standing was ${by("maths").percentage}%, expected 33%`);
  check(by("maths").isWeak, "maths at 2-of-6 should be flagged weak");
  check(!by("english").isWeak, "english at 1-of-2 is under the threshold but too small a sample to flag");
  check(!by("history").isWeak, "history at 3-of-3 must not be flagged weak");
  check(standing[0].subject.id === "history", "standing should be ordered strongest first");
}

// --- Today's agenda ---
{
  const sessions = [
    session(NOW, "maths", false, null, "16:05"),
    session(NOW, "english", true, NOW, "15:30"),
    session(subDays(NOW, 1), "history", false),
  ];

  const agenda = todayAgenda(sessions, NOW);
  check(agenda.length === 2, `agenda held ${agenda.length} items, expected 2 (today only)`);
  check(agenda[0].time === "15:30", "agenda must be ordered by start time");
  check(agenda[0].done === true, "agenda must carry completion through");
  check(agenda[0].id !== undefined, "agenda items need an id so the checkbox can toggle them");
}

// --- Streak ---
{
  // Studied Mon/Tue/Wed and again today; Sunday is the rest day.
  const unbroken = [
    session(subDays(NOW, 0), "maths", true),
    session(subDays(NOW, 1), "maths", true),
    session(subDays(NOW, 2), "maths", true),
    session(subDays(NOW, 3), "maths", true),
  ];
  check(studyStreak(unbroken, OFF_DAY, NOW).current === 4, "four consecutive studied days should read as a streak of 4");
  check(studyStreak(unbroken, OFF_DAY, NOW).studiedToday, "studiedToday must be true when today has a completion");

  // A scheduled day with nothing done breaks the run.
  const broken = [
    session(subDays(NOW, 0), "maths", true),
    session(subDays(NOW, 1), "maths", false),
    session(subDays(NOW, 2), "maths", true),
  ];
  check(studyStreak(broken, OFF_DAY, NOW).current === 1, "a missed scheduled day must break the streak");

  // The rest day is stepped over, not counted and not fatal.
  const sunday = new Date(2026, 8, 6); // Sun 6 Sep 2026
  check(sunday.getDay() === OFF_DAY, "fixture sanity: 6 Sep 2026 should be a Sunday");
  const acrossRestDay = [
    session(new Date(2026, 8, 7), "maths", true),
    session(new Date(2026, 8, 5), "maths", true),
  ];
  const restResult = studyStreak(acrossRestDay, OFF_DAY, new Date(2026, 8, 7, 20, 0));
  check(restResult.current === 2, `streak across a rest day read ${restResult.current}, expected 2`);

  // A day with nothing scheduled is likewise neutral.
  const acrossEmptyDay = [
    session(subDays(NOW, 0), "maths", true),
    session(subDays(NOW, 2), "maths", true),
  ];
  check(studyStreak(acrossEmptyDay, OFF_DAY, NOW).current === 2, "an empty day must not break a streak");

  // Today untouched but yesterday done: the streak stands, it has not collapsed.
  const morning = [
    session(subDays(NOW, 0), "maths", false),
    session(subDays(NOW, 1), "maths", true),
  ];
  const morningResult = studyStreak(morning, OFF_DAY, NOW);
  check(morningResult.current === 1, `an untouched today should leave yesterday's streak intact, got ${morningResult.current}`);
  check(!morningResult.studiedToday, "studiedToday must be false before anything is ticked");

  check(studyStreak([], OFF_DAY, NOW).current === 0, "no sessions at all means no streak");

  // completedAt drives the streak, not the session's scheduled date.
  const backTicked = [
    { ...session(subDays(NOW, 5), "maths", true), completedAt: NOW },
  ];
  check(
    studyStreak(backTicked, OFF_DAY, NOW).current === 1,
    "a session scheduled last week but ticked today should count towards today, not its own date"
  );
}

console.log(`\nSTATS CHECK  fixtures anchored at ${format(NOW, "EEE d MMM yyyy")}\n`);
if (failures.length === 0) {
  console.log("PASS — all insight aggregates behave as specified.");
} else {
  console.log(`FAIL — ${failures.length} problem(s):`);
  for (const f of failures) console.log(`  - ${f}`);
  process.exitCode = 1;
}
