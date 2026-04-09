import { isBefore, startOfDay, isToday as isDateToday } from "date-fns";
import type { DaySchedule } from "@/lib/types";
import SessionCard from "./SessionCard";

interface DayColumnProps {
  day: DaySchedule;
}

export default function DayColumn({ day }: DayColumnProps) {
  const dateObj = new Date(day.date);
  const isPast = isBefore(dateObj, startOfDay(new Date()));
  const isToday = isDateToday(dateObj);

  return (
    <td
      className={`align-top p-2 border-r border-ed-rule last:border-r-0 min-w-[120px] transition-all duration-300 ${
        isToday ? "bg-ed-paper" : ""
      } ${isPast ? "opacity-40 grayscale-[0.5]" : "opacity-100"}`}
    >
      {day.isOffDay ? (
        <div className="h-64 flex items-center justify-center font-display italic text-ed-ink-faint">
          — Rest —
        </div>
      ) : (
        <>
          {day.tests?.map((test: any) => (
            <div key={`test-${test.id}`} className="mb-2 p-2 border-2 border-ed-rust bg-ed-rust/5 text-center">
              <span className="block font-ui text-[0.6rem] uppercase tracking-widest text-ed-rust font-bold mb-1">
                 Exam Today
              </span>
              <span className="font-display text-sm font-bold text-ed-ink leading-tight">
                {test.name}
              </span>
            </div>
          ))}
          {day.sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
          {day.extramurals.map((ext) => {
            const now = new Date();
            const dateObj = new Date(day.date);
            const isToday = now.toDateString() === dateObj.toDateString();
            const [endH, endM] = ext.endTime.split(":").map(Number);
            const isPassed = isToday && (now.getHours() > endH || (now.getHours() === endH && now.getMinutes() >= endM));

            return (
              <div
                key={ext.id}
                className={`p-2 mb-2 border-l-[3px] transition-all duration-300 ${isPassed ? "opacity-40 grayscale border-l-ed-rule bg-ed-bg" : "border-l-ed-gold bg-ed-paper hover:translate-x-1 cursor-pointer"}`}
              >
                <p className={`font-ui text-[0.6rem] uppercase tracking-[0.05em] ${isPassed ? "text-ed-rule line-through" : "text-ed-ink-faint"}`}>
                  {ext.startTime} {isPassed && "— ✓"}
                </p>
                <p className={`font-display font-semibold text-sm mt-0.5 ${isPassed ? "text-ed-ink-light line-through" : "text-ed-ink"}`}>
                  {ext.emoji} {ext.name}
                </p>
              </div>
            );
          })}
        </>
      )}
    </td>
  );
}
