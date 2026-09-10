import type { SubjectStanding } from "@/lib/stats";
import { resolveSubjectColor } from "@/lib/utils";

interface ProgressBarProps {
  progress: SubjectStanding;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const fill = resolveSubjectColor(progress.subject.color, "bg");

  return (
    <div className="mb-3">
      <div className="flex justify-between font-ui text-xs mb-1 gap-2">
        <span className="font-semibold truncate">{progress.subject.name}</span>
        <span className="text-ed-ink-light whitespace-nowrap">
          {progress.completed}/{progress.total} · {progress.percentage}%
        </span>
      </div>
      <div className="h-1 bg-ed-rule">
        <div
          className={`h-full transition-all duration-700 ${fill.className}`}
          style={{ ...fill.style, width: `${progress.percentage}%` }}
        />
      </div>
      {progress.isWeak && (
        <p className="font-ui text-[0.55rem] uppercase tracking-[0.15em] text-ed-rust font-bold mt-1">
          Needs attention
        </p>
      )}
    </div>
  );
}
