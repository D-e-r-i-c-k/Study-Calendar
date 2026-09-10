import type { CSSProperties } from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// Subject colours
// ============================================
// Subject.color is a free-text column that has accumulated three shapes over time:
// a bare palette name ("rust"), a Tailwind utility ("bg-ed-rust") and a hex string
// ("#8c4a2f"). Every consumer needs it as a background, text or border colour, so
// normalise here instead of in each component. The class names map onto the static
// .subject-* rules in globals.css, which survive Tailwind's class scanner.

const SUBJECT_PALETTE = ["rust", "navy", "olive", "burgundy", "gold", "ink"] as const;

type PaletteName = (typeof SUBJECT_PALETTE)[number];

export interface SubjectColorStyle {
  className: string;
  style: CSSProperties;
}

export function resolveSubjectColor(
  color: string | null | undefined,
  variant: "bg" | "color" | "border" = "bg"
): SubjectColorStyle {
  const value = color?.trim() ?? "";

  if (value.startsWith("#")) {
    const style: CSSProperties =
      variant === "bg"
        ? { backgroundColor: value }
        : variant === "border"
          ? { borderColor: value }
          : { color: value };
    return { className: "", style };
  }

  // Strip any leading utility prefix so "bg-ed-rust" and "text-ed-rust" both
  // reduce to the bare palette name.
  const name = value.replace(/^(bg|text|border)-/, "").replace(/^ed-/, "");
  const known: PaletteName = (SUBJECT_PALETTE as readonly string[]).includes(name)
    ? (name as PaletteName)
    : "ink";

  return { className: `subject-${variant}-${known}`, style: {} };
}
