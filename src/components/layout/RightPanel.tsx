import type { SubjectProgress } from "@/lib/types";
import StatBlock from "@/components/stats/StatBlock";
import ProgressBar from "@/components/stats/ProgressBar";
import TodayAgenda from "@/components/stats/TodayAgenda";

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

      <button className="w-full py-3 mt-5 border border-ed-ink bg-transparent font-ui text-xs font-semibold uppercase tracking-[0.15em] text-ed-ink cursor-pointer transition-all duration-300 hover:bg-ed-ink hover:text-ed-bg">
        + Schedule Examination
      </button>
    </aside>
  );
}
