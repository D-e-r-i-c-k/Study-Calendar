"use client";

import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday 
} from "date-fns";

interface MonthGridProps {
  currentDate: Date;
  sessions: any[];
  extramurals: any[];
  tests: any[];
  onChangeDate: (date: Date) => void;
  onPrev: () => void;
  onNext: () => void;
}

const typeColorMap: Record<string, string> = {
  learn: "bg-ed-rust",
  review: "bg-ed-navy",
  practice: "bg-ed-olive",
};

export default function MonthGrid({ currentDate, sessions, tests, onChangeDate, onPrev, onNext }: MonthGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="border-t border-b border-ed-ink mt-4 pb-8">
      {/* Header spanning the top */}
      <div className="flex justify-between items-end mb-6 pt-4 px-2">
        <div className="flex items-center gap-6">
          <h2 className="font-display text-4xl font-bold tracking-tight text-ed-ink">
            {format(currentDate, "MMMM")}
            <span className="text-ed-ink-light ml-3 font-normal italic">
              {format(currentDate, "yyyy")}
            </span>
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="w-8 h-8 border border-ed-rule bg-transparent font-display text-lg text-ed-ink cursor-pointer transition-all duration-300 hover:bg-ed-ink hover:text-ed-bg"
            >
              ‹
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="w-8 h-8 border border-ed-rule bg-transparent font-display text-lg text-ed-ink cursor-pointer transition-all duration-300 hover:bg-ed-ink hover:text-ed-bg"
            >
              ›
            </button>
          </div>
        </div>
        <div className="font-ui text-xs uppercase tracking-[0.2em] text-ed-ink-light font-semibold">
          Almanac Ledger
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b-2 border-ed-ink pb-2 mb-4">
        {dayNames.map((name) => (
          <div key={name} className="font-ui text-[0.65rem] uppercase tracking-[0.15em] text-ed-ink-light font-semibold px-2">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Matrix */}
      <div className="grid grid-cols-7 gap-y-6">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isCurrentDay = isToday(day);
          
          // Find sessions and tests for this day
          const daySessions = sessions.filter(s => isSameDay(new Date(s.date), day));
          const dayTests = tests?.filter(t => isSameDay(new Date(t.date), day)) || [];
          
          return (
            <div 
              key={day.toString()} 
              onClick={() => onChangeDate(day)}
              className={`
                min-h-[100px] border-r border-ed-rule last:border-r-0 px-2 cursor-pointer
                transition-colors duration-200 hover:bg-ed-paper/50 relative
                ${!isCurrentMonth ? "opacity-30" : "opacity-100"}
                ${i % 7 === 0 ? "border-l-0" : ""}
                ${i % 7 === 6 ? "border-r-0" : ""}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`
                  font-display text-xl font-bold
                  ${isCurrentDay ? "text-ed-bg bg-ed-ink rounded-full w-8 h-8 flex items-center justify-center -ml-1 -mt-1" : "text-ed-ink"}
                `}>
                  {format(day, dateFormat)}
                </span>
                
                {/* Dots indicator for heavy days */}
                {daySessions.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap justify-end max-w-[50%]">
                    {daySessions.slice(0, 3).map((sess, idx) => (
                      <div 
                        key={idx} 
                        className={`w-1.5 h-1.5 rounded-full ${typeColorMap[sess.type] || "bg-ed-gold"}`}
                      />
                    ))}
                    {daySessions.length > 3 && (
                      <span className="font-ui text-[0.5rem] leading-[0.5rem] text-ed-ink font-bold">+</span>
                    )}
                  </div>
                )}
              </div>

              {/* Condensed Text List for Month View */}
              <div className="space-y-1">
                {/* Always show Exams First */}
                {dayTests.map(test => (
                  <div key={`test-${test.id}`} className="text-[0.6rem] font-ui font-bold uppercase tracking-wide truncate text-ed-rust bg-ed-rust/10 border border-ed-rust/30 px-1 py-0.5 leading-tight">
                    ★ EXAM: {test.name}
                  </div>
                ))}

                {/* Show normal study sessions */}
                {daySessions.slice(0, 2).map((sess) => (
                  <div key={sess.id} className="text-[0.6rem] font-ui uppercase tracking-wide truncate text-ed-ink leading-tight">
                    <span className="text-ed-ink-faint mr-1">{sess.startTime}</span>
                    {sess.test.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
