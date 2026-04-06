import type {
  Subject,
  Test,
  StudySession,
  Extramural,
  DaySchedule,
  WeekSchedule,
  SubjectProgress,
} from "./types";

// ============================================
// Subjects
// ============================================
export const subjects: Subject[] = [
  { id: "s1", name: "Mathematics", color: "rust" },
  { id: "s2", name: "Physical Science", color: "navy" },
  { id: "s3", name: "English", color: "olive" },
  { id: "s4", name: "History", color: "burgundy" },
  { id: "s5", name: "Geography", color: "gold" },
];

// ============================================
// Tests
// ============================================
export const tests: Test[] = [
  {
    id: "t1",
    subjectId: "s1",
    subject: subjects[0],
    name: "Algebra & Functions",
    topics: ["Quadratics", "Factoring", "Functions"],
    date: "2026-04-14",
    difficulty: 7,
    prepDays: 10,
  },
  {
    id: "t2",
    subjectId: "s2",
    subject: subjects[1],
    name: "Chemical Reactions",
    topics: ["Balancing equations", "Reaction types"],
    date: "2026-04-17",
    difficulty: 5,
    prepDays: 8,
  },
  {
    id: "t3",
    subjectId: "s3",
    subject: subjects[2],
    name: "Poetry Analysis",
    topics: ["Figurative language", "Tone", "Theme"],
    date: "2026-04-20",
    difficulty: 3,
    prepDays: 7,
  },
];

// ============================================
// Extramurals
// ============================================
export const extramurals: Extramural[] = [
  {
    id: "e1",
    name: "Soccer Practice",
    dayOfWeek: 1, // Monday
    startTime: "17:00",
    endTime: "18:00",
    emoji: "⚽",
  },
  {
    id: "e2",
    name: "Soccer Match",
    dayOfWeek: 4, // Thursday
    startTime: "17:00",
    endTime: "18:00",
    emoji: "⚽",
  },
];

// ============================================
// Study Sessions (Week 15: April 6–12, 2026)
// ============================================
function session(
  id: string,
  testIndex: number,
  date: string,
  startTime: string,
  type: "learn" | "review" | "practice",
  completed = false
): StudySession {
  return {
    id,
    testId: tests[testIndex].id,
    test: tests[testIndex],
    date,
    startTime,
    duration: 25,
    type,
    completed,
  };
}

export const sessions: StudySession[] = [
  // Monday Apr 6
  session("ss1", 0, "2026-04-06", "15:30", "learn", true),
  session("ss2", 1, "2026-04-06", "16:05", "review", true),
  // Tuesday Apr 7
  session("ss3", 0, "2026-04-07", "15:30", "learn", true),
  session("ss4", 2, "2026-04-07", "16:05", "learn"),
  session("ss5", 0, "2026-04-07", "16:40", "review"),
  // Wednesday Apr 8
  session("ss6", 1, "2026-04-08", "15:30", "review"),
  session("ss7", 3 < tests.length ? 0 : 0, "2026-04-08", "16:05", "learn"),
  // Thursday Apr 9
  session("ss8", 0, "2026-04-09", "15:30", "review"),
  session("ss9", 0, "2026-04-09", "16:05", "learn"),
  // Friday Apr 10
  session("ss10", 0, "2026-04-10", "15:30", "practice"),
  session("ss11", 2, "2026-04-10", "16:05", "review"),
  // Saturday Apr 11
  session("ss12", 1, "2026-04-11", "10:00", "learn"),
  session("ss13", 0, "2026-04-11", "10:35", "review"),
];

// ============================================
// Week Schedule Builder
// ============================================
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getWeekSchedule(): WeekSchedule {
  const days: DaySchedule[] = [];
  const startDate = new Date("2026-04-06"); // Monday

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();

    days.push({
      date: dateStr,
      dayName: dayNames[dayOfWeek],
      dayNumber: date.getDate(),
      isToday: i === 1, // Tuesday is "today"
      isOffDay: dayOfWeek === 0, // Sunday
      sessions: sessions.filter((s) => s.date === dateStr),
      extramurals: extramurals.filter((e) => e.dayOfWeek === dayOfWeek),
    });
  }

  return {
    weekNumber: 15,
    startDate: "2026-04-06",
    endDate: "2026-04-12",
    days,
  };
}

// ============================================
// Stats
// ============================================
export const subjectProgress: SubjectProgress[] = [
  { subject: subjects[0], percentage: 65 },
  { subject: subjects[1], percentage: 40 },
  { subject: subjects[2], percentage: 25 },
  { subject: subjects[3], percentage: 10 },
];

export const weeklyStats = {
  sessionsCompleted: 14,
  sessionsTotal: 18,
  completionRate: 78,
  completionDelta: 5, // +5%
};

// ============================================
// Today's agenda
// ============================================
export const todayAgenda = [
  { time: "15:30", title: "Functions", subtitle: "New Learning", done: true },
  { time: "16:05", title: "Poetry Terms", subtitle: "New Learning", done: false },
  { time: "16:40", title: "Algebra Ch.4", subtitle: "Day 2 Review", done: false },
];
