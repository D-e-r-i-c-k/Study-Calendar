import type { DaySchedule } from "@/lib/types";
import SessionCard from "./SessionCard";

interface DayColumnProps {
  day: DaySchedule;
}

export default function DayColumn({ day }: DayColumnProps) {
  return (
    <td
      className={`align-top p-2 border-r border-ed-rule last:border-r-0 min-w-[120px] ${
        day.isToday ? "bg-ed-paper" : ""
      }`}
    >
      {day.isOffDay ? (
        <div className="h-64 flex items-center justify-center font-display italic text-ed-ink-faint">
          — Rest —
        </div>
      ) : (
        <>
          {day.sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
          {day.extramurals.map((ext) => (
            <div
              key={ext.id}
              className="p-2 mb-2 border-l-[3px] border-l-ed-gold bg-ed-paper cursor-pointer transition-transform duration-300 hover:translate-x-1"
            >
              <p className="font-ui text-[0.6rem] text-ed-ink-faint uppercase tracking-[0.05em]">
                {ext.startTime}
              </p>
              <p className="font-display font-semibold text-sm mt-0.5">
                {ext.emoji} {ext.name}
              </p>
            </div>
          ))}
        </>
      )}
    </td>
  );
}
