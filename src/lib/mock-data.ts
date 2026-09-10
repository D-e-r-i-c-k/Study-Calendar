// Seed fixtures only.
//
// This file used to back the dashboard as well; it no longer does. Sessions come
// from the Phase 4 engine and every statistic is computed from the database by
// src/lib/stats.ts. What remains is the starting slate ensureSeeded() writes on
// first run — see src/app/actions.ts.

import type { Subject, Test, Extramural } from "./types";

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
