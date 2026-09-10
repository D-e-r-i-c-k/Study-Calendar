import { isBefore, startOfDay, isToday as isDateToday } from "date-fns";
import type { DaySchedule } from "@/lib/types";
import SessionCard from "./SessionCard";

interface DayColumnProps {
  day: DaySchedule;
  onClick?: () => void;
}

export default function DayColumn({ day, onClick }: DayColumnProps) {
  const dateObj = new Date(day.date);
  const isPast = isBefore(startOfDay(dateObj), startOfDay(new Date()));
  const isToday = isDateToday(dateObj);

  const timedItems = [
    ...day.sessions.map(sess => ({ ...sess, isSession: true, isExtramural: false, isEvent: false })),
    ...day.extramurals.map(ext => ({ ...ext, isSession: false, isExtramural: true, isEvent: false })),
    ...(day.events || []).map(evt => ({ ...evt, isSession: false, isExtramural: false, isEvent: true }))
  ].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <td
      onClick={onClick}
      className={`align-top p-2 border-r border-ed-rule last:border-r-0 min-w-[120px] cursor-pointer hover:bg-ed-ink/[0.02] active:bg-ed-ink/[0.04] transition-all duration-300 ${isToday ? "bg-ed-paper" : ""
        } ${isToday ? "opacity-100" : isPast ? "opacity-40 grayscale-[0.5]" : "opacity-100"}`}
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
          {timedItems.map((item: any) => {
            if (item.isSession) {
              return <SessionCard key={item.id} session={item as any} />;
            }

            if (item.isExtramural) {
              const now = new Date();
              const dateObj = new Date(day.date);
              const isToday = now.toDateString() === dateObj.toDateString();
              const [endH, endM] = item.endTime.split(":").map(Number);
              const isPassed = isToday && (now.getHours() > endH || (now.getHours() === endH && now.getMinutes() >= endM));

              return (
                <div
                  key={item.id}
                  className={`p-2 mb-2 border-l-[3px] transition-all duration-300 ${isPassed ? "opacity-40 grayscale border-l-ed-rule bg-ed-bg" : "border-l-ed-gold bg-ed-paper hover:translate-x-1 cursor-pointer"}`}
                >
                  <p className={`font-ui text-[0.6rem] uppercase tracking-[0.05em] ${isPassed ? "text-ed-rule" : "text-ed-ink-faint"}`}>
                    {item.startTime}
                  </p>
                  <p className={`font-display font-semibold text-sm mt-0.5 ${isPassed ? "text-ed-ink-light" : "text-ed-ink"}`}>
                    {item.emoji} {item.name}
                  </p>
                </div>
              );
            }

            if (item.isEvent) {
              const now = new Date();
              const dateObj = new Date(day.date);
              const isToday = now.toDateString() === dateObj.toDateString();
              const [endH, endM] = item.endTime.split(":").map(Number);
              const isPassed = isToday && (now.getHours() > endH || (now.getHours() === endH && now.getMinutes() >= endM));

              return (
                <div
                  key={item.id}
                  className={`p-2 mb-2 border-l-[3px] transition-all duration-300 ${isPassed ? "opacity-40 grayscale border-l-ed-rule bg-ed-bg" : "border-l-ed-rust bg-ed-paper hover:translate-x-1 cursor-pointer"}`}
                >
                  <p className={`font-ui text-[0.6rem] uppercase tracking-[0.05em] ${isPassed ? "text-ed-rule" : "text-ed-ink-faint"}`}>
                    {item.startTime} — {item.endTime}
                  </p>
                  <p className={`font-display font-semibold text-sm mt-0.5 ${isPassed ? "text-ed-ink-light line-through" : "text-ed-ink"}`}>
                    {item.emoji || "📅"} {item.name}
                  </p>
                </div>
              );
            }

            return null;
          })}
        </>
      )}
    </td>
  );
}
