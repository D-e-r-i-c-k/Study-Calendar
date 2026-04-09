import * as z from "zod";

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
    required_error: "A valid date is required.",
  }),
  difficulty: z.number().min(1).max(10),
  prepDays: z.number().min(1).max(30),
});

export type ExaminationInput = z.infer<typeof examinationSchema>;

// --- Onboarding / Academic Profile Validations ---
export const profileSchema = z.object({
  grade: z.string().min(1, "Grade is required."),
  curriculum: z.string().min(1, "Curriculum is required."),
  school: z.string().min(2, "School name is required."),
  schoolEndTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Invalid time structure."),
  studyEndTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Invalid time structure."),
  dailyBuffer: z.number().min(0).max(120),
  offDay: z.number().min(0).max(6),
});

export type ProfileInput = z.infer<typeof profileSchema>;
