import type { SubjectProgress } from "@/lib/types";
import StatBlock from "@/components/stats/StatBlock";
import ProgressBar from "@/components/stats/ProgressBar";
import TodayAgenda from "@/components/stats/TodayAgenda";
import GenerateScheduleButton from "@/components/calendar/GenerateScheduleButton";

interface RightPanelProps {
  stats: {
    sessionsCompleted: number;
    sessionsTotal: number;
    completionRate: number;
    completionDelta: number;
  };
  progress: SubjectProgress[];
  todayItems: {
    time: string;
    title: string;
    subtitle: string;
    done: boolean;
  }[];
}

export default function RightPanel({
  stats,
  progress,
  todayItems,
}: RightPanelProps) {
  return (
    <aside className="border-l border-ed-rule p-6 min-w-[260px]">
      <div className="section-head">Weekly Figures</div>
      <StatBlock
        value={String(stats.sessionsCompleted)}
        suffix={`/${stats.sessionsTotal}`}
        caption="Sessions Completed"
      />
      <StatBlock
        value={`${stats.completionRate}%`}
        caption={`Completion Rate (↑${stats.completionDelta}%)`}
      />

      <div className="section-head">Subject Standing</div>
      {progress.map((p) => (
        <ProgressBar key={p.subject.id} progress={p} />
      ))}

      <TodayAgenda items={todayItems} />

      <div className="mt-5">
        <GenerateScheduleButton compact />
      </div>
    </aside>
  );
}
