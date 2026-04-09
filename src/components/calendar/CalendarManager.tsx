"use client";

import { useState, useEffect } from "react";
import { addWeeks, subWeeks, addMonths, subMonths, startOfWeek, addDays, isSameDay, getWeek, format } from "date-fns";
import type { CalendarState, ViewMode, TimeMode } from "@/lib/calendar-types";
import CalendarGrid from "./CalendarGrid";
import MonthGrid from "./MonthGrid";
import DayTimeline from "./DayTimeline";

interface CalendarManagerProps {
  initialDate: Date;
  sessions: any[]; // Using any for now to map from Prisma
  extramurals: any[];
  tests: any[];
}

export default function CalendarManager({
  initialDate,
  sessions,
  extramurals,
  tests,
}: CalendarManagerProps) {
  const [state, setState] = useState<CalendarState>({
    currentDate: initialDate,
    viewMode: "month",
    timeMode: "condensed",
  });

  // Client-side Hydration for persistent viewMode
  useEffect(() => {
    const saved = localStorage.getItem("studyCalendarView") as ViewMode;
    if (saved) {
      setState(s => ({ ...s, viewMode: saved }));
    }
  }, []);

  const changeViewMode = (mode: ViewMode) => {
    setState(s => ({ ...s, viewMode: mode }));
    localStorage.setItem("studyCalendarView", mode);
  };

  const handlePrev = () => {
    if (state.viewMode === "month") {
      setState((s) => ({ ...s, currentDate: subMonths(s.currentDate, 1) }));
    } else {
      setState((s) => ({ ...s, currentDate: subWeeks(s.currentDate, 1) }));
    }
  };

  const handleNext = () => {
    if (state.viewMode === "month") {
      setState((s) => ({ ...s, currentDate: addMonths(s.currentDate, 1) }));
    } else {
      setState((s) => ({ ...s, currentDate: addWeeks(s.currentDate, 1) }));
    }
  };

  // Compute Week Schedule dynamically
  const buildWeekSchedule = () => {
    const weekStart = startOfWeek(state.currentDate, { weekStartsOn: 0 }); // 0 = Sunday
    const weekEnd = addDays(weekStart, 6);
    
    // Calculate week number dynamically based on the current date
    const weekNumber = getWeek(state.currentDate, { weekStartsOn: 0 }); 
    
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();

    const days = Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(weekStart, i);
      const isToday = isSameDay(date, today);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayOfWeek = date.getDay();

      // Find sessions for this specific date
      const daySessions = sessions.filter(s => {
        const sDate = new Date(s.date);
        return isSameDay(sDate, date);
      });

      const dayTests = tests?.filter(t => isSameDay(new Date(t.date), date)) || [];

      // Extramurals repeat weekly for now
      const dayExtramurals = extramurals.filter(e => e.dayOfWeek === dayOfWeek);

      return {
        date: dateStr,
        dayName: dayNames[dayOfWeek],
        dayNumber: date.getDate(),
        isToday,
        isOffDay: dayOfWeek === 0, // Mock: Sunday is off day
        sessions: daySessions,
        extramurals: dayExtramurals,
        tests: dayTests,
      };
    });

    return {
      weekNumber,
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      days,
    };
  };

  const weekData = buildWeekSchedule();

  return (
    <div>
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex gap-4">
          <button 
            className={`font-ui text-xs font-semibold uppercase tracking-wider pb-1 border-b-2 transition-all ${state.viewMode === "week" ? "border-ed-rust text-ed-ink" : "border-transparent text-ed-ink-light hover:text-ed-ink"}`}
            onClick={() => changeViewMode("week")}
          >
            Week
          </button>
          <button 
            className={`font-ui text-xs font-semibold uppercase tracking-wider pb-1 border-b-2 transition-all ${state.viewMode === "month" ? "border-ed-rust text-ed-ink" : "border-transparent text-ed-ink-light hover:text-ed-ink"}`}
            onClick={() => changeViewMode("month")}
          >
            Ledger
          </button>
          <button 
            className={`font-ui text-xs font-semibold uppercase tracking-wider pb-1 border-b-2 transition-all ${state.viewMode === "day" ? "border-ed-rust text-ed-ink" : "border-transparent text-ed-ink-light hover:text-ed-ink"}`}
            onClick={() => changeViewMode("day")}
          >
            Itinerary
          </button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {state.viewMode === "week" && (
          <CalendarGrid 
            week={weekData} 
            onPrev={handlePrev} 
            onNext={handleNext} 
            tests={tests}
          />
        )}
        
        {state.viewMode === "month" && (
          <MonthGrid 
             currentDate={state.currentDate}
             sessions={sessions}
             extramurals={extramurals}
             tests={tests}
             onChangeDate={(d: Date) => setState((s) => ({ ...s, currentDate: d, viewMode: "week" }))}
             onPrev={handlePrev}
             onNext={handleNext}
          />
        )}

        {state.viewMode === "day" && (
           <DayTimeline 
             currentDate={state.currentDate}
             sessions={sessions}
             extramurals={extramurals}
             onPrev={() => setState(s => ({ ...s, currentDate: addDays(s.currentDate, -1) }))}
             onNext={() => setState(s => ({ ...s, currentDate: addDays(s.currentDate, 1) }))}
           />
        )}
      </div>
    </div>
  );
}
