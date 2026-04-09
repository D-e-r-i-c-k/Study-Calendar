// ============================================
// Smart Study Planner – Core Type Definitions
// ============================================

export type SessionType = "learn" | "review" | "practice";

export type SubjectColor = "rust" | "navy" | "olive" | "burgundy" | "gold";

export interface Subject {
  id: string;
  name: string;
  color: SubjectColor;
}

export interface Test {
  id: string;
  subjectId: string;
  subject: Subject;
  name: string;
  topics: string[];
  date: string; // ISO date string
  difficulty: number; // 1-10
  prepDays: number;
}

export interface StudySession {
  id: string;
  testId: string;
  test: Test;
  date: string; // ISO date string
  startTime: string; // "15:30"
  duration: number; // minutes
  type: SessionType;
  completed: boolean;
}

export interface Extramural {
  id: string;
  name: string;
  dayOfWeek: number; // 0=Sun, 6=Sat
  startTime: string;
  endTime: string;
  emoji?: string;
}

export interface DaySchedule {
  date: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isOffDay: boolean;
  sessions: StudySession[];
  extramurals: Extramural[];
  tests?: any[];
}

export interface WeekSchedule {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: DaySchedule[];
}

export interface UserProfile {
  id: string;
  name: string;
  grade: string;
  curriculum: string;
  school: string;
  schoolEndTime: string;
  arrivalHome: string;
  studyEndTime: string;
  dailyBuffer: number; // minutes
  offDay: number; // 0=Sun, 6=Sat
}

export interface SubjectProgress {
  subject: Subject;
  percentage: number;
}
