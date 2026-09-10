import type { AgendaItem, StreakSummary, SubjectStanding, WeeklyFigures } from "@/lib/stats";
import StatBlock from "@/components/stats/StatBlock";
import ProgressBar from "@/components/stats/ProgressBar";
import StreakBanner from "@/components/stats/StreakBanner";
import TodayAgenda from "@/components/stats/TodayAgenda";
import GenerateScheduleButton from "@/components/calendar/GenerateScheduleButton";

interface RightPanelProps {
  stats: WeeklyFigures;
  progress: SubjectStanding[];
  todayItems: AgendaItem[];
  streak: StreakSummary;
}

export default function RightPanel({
  stats,
  progress,
  todayItems,
  streak,
}: RightPanelProps) {
  // The delta is real now, so it can fall as well as rise — the arrow has to
  // follow the sign rather than always pointing up.
  const delta =
    stats.completionDelta === 0
      ? "level on last week"
      : `${stats.completionDelta > 0 ? "↑" : "↓"}${Math.abs(stats.completionDelta)}% on last week`;

  return (
    <aside className="border-l border-ed-rule p-6 min-w-[260px]">
      <StreakBanner streak={streak} />

      <div className="section-head">Weekly Figures</div>
      <StatBlock
        value={String(stats.sessionsCompleted)}
        suffix={`/${stats.sessionsTotal}`}
        caption="Sessions Completed"
      />
      <StatBlock
        value={`${stats.completionRate}%`}
        caption={`Completion Rate (${delta})`}
      />

      <div className="section-head">Subject Standing</div>
      {progress.length === 0 ? (
        <p className="font-body text-sm text-ed-ink-light italic mb-3">
          No sessions have fallen due yet.
        </p>
      ) : (
        progress.map((p) => <ProgressBar key={p.subject.id} progress={p} />)
      )}

      <TodayAgenda items={todayItems} />

      <div className="mt-5">
        <GenerateScheduleButton compact />
      </div>
    </aside>
  );
}
