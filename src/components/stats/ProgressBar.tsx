import type { SubjectProgress } from "@/lib/types";
import { resolveSubjectColor } from "@/lib/utils";

interface ProgressBarProps {
  progress: SubjectProgress;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const fill = resolveSubjectColor(progress.subject.color, "bg");

  return (
    <div className="mb-3">
      <div className="flex justify-between font-ui text-xs mb-1">
        <span className="font-semibold">{progress.subject.name}</span>
        <span className="text-ed-ink-light">{progress.percentage}%</span>
      </div>
      <div className="h-1 bg-ed-rule">
        <div
          className={`h-full transition-all duration-700 ${fill.className}`}
          style={{ ...fill.style, width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}
