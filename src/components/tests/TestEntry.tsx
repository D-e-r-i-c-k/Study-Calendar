import type { Test, SubjectColor } from "@/lib/types";
import DifficultyBar from "./DifficultyBar";

const colorMap: Record<SubjectColor, string> = {
  rust: "text-ed-rust",
  navy: "text-ed-navy",
  olive: "text-ed-olive",
  burgundy: "text-ed-burgundy",
  gold: "text-ed-gold",
};

interface TestEntryProps {
  test: Test;
}

export default function TestEntry({ test }: TestEntryProps) {
  const testDate = new Date(test.date);
  const now = new Date();
  const diffTime = testDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const dateFormatted = testDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mb-5 pb-5 border-b border-ed-rule">
      <p
        className={`font-ui text-[0.6rem] uppercase tracking-[0.15em] font-semibold ${colorMap[test.subject.color]}`}
      >
        {test.subject.name}
      </p>
      <h3 className="font-display text-lg font-bold leading-tight mt-0.5">
        {test.name}
      </h3>
      <p className="font-body text-sm italic text-ed-ink-light">
        {dateFormatted} — {daysRemaining} days remaining
      </p>
      <DifficultyBar difficulty={test.difficulty} />
    </div>
  );
}
