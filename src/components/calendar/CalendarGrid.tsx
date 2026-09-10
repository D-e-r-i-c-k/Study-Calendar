import type { WeekSchedule } from "@/lib/types";
import WeekHeader from "./WeekHeader";
import DayColumn from "./DayColumn";

interface CalendarGridProps {
  week: any;
  onPrev?: () => void;
  onNext?: () => void;
  onChangeDate?: (date: Date) => void;
}

export default function CalendarGrid({ week, onPrev, onNext, onChangeDate }: CalendarGridProps) {
  return (
    <div>
      <WeekHeader
        weekNumber={week.weekNumber}
        startDate={week.startDate}
        endDate={week.endDate}
        onPrev={onPrev}
        onNext={onNext}
      />
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {week.days.map((day: any) => (
                <th
                  key={day.date}
                  onClick={() => onChangeDate?.(new Date(day.date))}
                  className={`
                    font-ui text-[0.65rem] uppercase tracking-[0.15em] text-ed-ink-light 
                    font-semibold p-2 border-b-2 border-ed-ink text-left cursor-pointer hover:bg-ed-paper/30 transition-colors
                    ${day.isToday ? "bg-ed-paper" : ""}
                    ${
                      day.isOffDay
                        ? "bg-[repeating-linear-gradient(-45deg,transparent,transparent_3px,var(--color-ed-rule)_3px,var(--color-ed-rule)_4px)]"
                        : ""
                    }
                  `}
                >
                  {day.dayName}
                  <span
                    className={`block font-display text-2xl font-bold tracking-normal normal-case ${
                      day.isToday ? "text-ed-rust" : "text-ed-ink"
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {week.days.map((day: any) => (
                <DayColumn
                  key={day.date}
                  day={day}
                  onClick={() => onChangeDate?.(new Date(day.date))}
                />
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
