import type { WeekSchedule } from "@/lib/types";
import WeekHeader from "./WeekHeader";
import DayColumn from "./DayColumn";

interface CalendarGridProps {
  week: WeekSchedule;
}

export default function CalendarGrid({ week }: CalendarGridProps) {
  return (
    <div>
      <WeekHeader
        weekNumber={week.weekNumber}
        startDate={week.startDate}
        endDate={week.endDate}
      />
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {week.days.map((day) => (
                <th
                  key={day.date}
                  className={`
                    font-ui text-[0.65rem] uppercase tracking-[0.15em] text-ed-ink-light 
                    font-semibold p-2 border-b-2 border-ed-ink text-left
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
              {week.days.map((day) => (
                <DayColumn key={day.date} day={day} />
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
