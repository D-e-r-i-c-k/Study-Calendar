import * as z from "zod";

// "HH:MM" (the colon stays optional to match values already stored in the DB).
const TIME_REGEX = /^([01]\d|2[0-3]):?([0-5]\d)$/;

// --- Subject Validations ---
export const subjectSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters."),
  color: z.string().min(2, "Please select or enter a color."),
});

export type SubjectInput = z.infer<typeof subjectSchema>;

// --- Examination Validations ---
export const examinationSchema = z.object({
  subjectId: z.string().min(1, "Please select an affiliated subject."),
  name: z.string().min(2, "Exam name must be descriptive."),
  date: z.date({
    message: "A valid date is required.",
  }),
  difficulty: z.number().min(1).max(10),
  prepDays: z.number().min(1).max(30),
});

export type ExaminationInput = z.infer<typeof examinationSchema>;

// --- Extramural Validations ---
export const extramuralSchema = z.object({
  name: z.string().min(2, "Name must be descriptive."),
  days: z.array(z.number()).min(1, "Select at least one day."),
  startTime: z.string().regex(TIME_REGEX, "Invalid time structure."),
  endTime: z.string().regex(TIME_REGEX, "Invalid time structure."),
  emoji: z.string().optional(),
}).refine((v) => v.endTime > v.startTime, {
  message: "End time must fall after the start time.",
  path: ["endTime"],
});

export type ExtramuralInput = z.infer<typeof extramuralSchema>;

// --- Onboarding / Academic Profile Validations ---
export const profileSchema = z.object({
  grade: z.string().min(1, "Grade is required."),
  curriculum: z.string().min(1, "Curriculum is required."),
  school: z.string().min(2, "School name is required."),
  schoolEndTime: z.string().regex(TIME_REGEX, "Invalid time structure."),
  arrivalHome: z.string().regex(TIME_REGEX, "Invalid time structure."),
  studyEndTime: z.string().regex(TIME_REGEX, "Invalid time structure."),
  dailyBuffer: z.number().min(0).max(120),
  tz: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// --- Once-off Event Validations ---
export const eventSchema = z.object({
  name: z.string().min(2, "Name must be descriptive."),
  date: z.date({ message: "A valid date is required." }),
  startTime: z.string().regex(TIME_REGEX, "Invalid time structure."),
  endTime: z.string().regex(TIME_REGEX, "Invalid time structure."),
  emoji: z.string().optional(),
}).refine((v) => v.endTime > v.startTime, {
  message: "End time must fall after the start time.",
  path: ["endTime"],
});

export type EventInput = z.infer<typeof eventSchema>;

// --- Scheduling Preferences Validations ---
// Feeds the Phase 4 scheduling engine. Every field has a built-in default, so
// these are knobs rather than requirements.
export const preferencesSchema = z.object({
  sessionMinutes: z.number().min(15, "Focus blocks shorter than 15m are unproductive.").max(60),
  breakMinutes: z.number().min(0).max(15),
  maxSessionsPerDay: z.number().min(1).max(12),
  maxSubjectsPerDay: z.number().min(1).max(5),
  weekendStartTime: z.string().regex(TIME_REGEX, "Invalid time structure."),
  offDay: z.number().min(0).max(6),
  spacingOffsets: z
    .string()
    .regex(/^\s*\d+\s*(,\s*\d+\s*)*$/, "Use comma-separated day numbers, e.g. 1,2,4,7,10.")
    .refine((v) => {
      const parts = v.split(",").map((n) => Number(n.trim()));
      return parts.every((n, i) => n >= 1 && (i === 0 || n > parts[i - 1]));
    }, "Offsets must start at 1 or higher and ascend."),
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;
