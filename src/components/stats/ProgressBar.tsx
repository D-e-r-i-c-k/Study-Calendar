import type { SubjectProgress, SubjectColor } from "@/lib/types";

const fillColorMap: Record<SubjectColor, string> = {
  rust: "bg-ed-rust",
  navy: "bg-ed-navy",
  olive: "bg-ed-olive",
  burgundy: "bg-ed-burgundy",
  gold: "bg-ed-gold",
};

interface ProgressBarProps {
  progress: SubjectProgress;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between font-ui text-xs mb-1">
        <span className="font-semibold">{progress.subject.name}</span>
        <span className="text-ed-ink-light">{progress.percentage}%</span>
      </div>
      <div className="h-1 bg-ed-rule">
        <div
          className={`h-full transition-all duration-700 ${fillColorMap[progress.subject.color]}`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}
