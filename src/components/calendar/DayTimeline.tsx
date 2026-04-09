"use client";

import { format, isBefore, startOfDay } from "date-fns";
import SessionCard from "./SessionCard";
import type { StudySession } from "@/lib/types";

interface DayTimelineProps {
  currentDate: Date;
  sessions: any[];
  extramurals: any[];
  onPrev: () => void;
  onNext: () => void;
}

export default function DayTimeline({ currentDate, sessions, extramurals, onPrev, onNext }: DayTimelineProps) {
  const isPast = isBefore(startOfDay(currentDate), startOfDay(new Date()));

  // Combine sessions and extramurals logically
  const timelineItems = [
    ...sessions
      .filter(s => new Date(s.date).toDateString() === currentDate.toDateString())
      .map(s => ({ ...s, isSession: true })),
    ...extramurals
      .filter(e => e.dayOfWeek === currentDate.getDay())
      .map(e => ({ ...e, isExtramural: true }))
  ].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="max-w-2xl mx-auto mt-4 pb-12 transition-all duration-500">
      {/* Day Header */}
      <div className="flex items-center justify-between border-b-2 border-ed-ink pb-6 mb-8">
        <div>
          <h2 className="font-display text-5xl font-bold tracking-tight text-ed-ink">
            {format(currentDate, "EEEE")}
          </h2>
          <p className="font-ui text-sm uppercase tracking-[0.2em] text-ed-ink-light font-semibold mt-2">
            {format(currentDate, "MMMM do, yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onPrev}
            className="w-10 h-10 border border-ed-rule bg-transparent font-display text-xl text-ed-ink cursor-pointer transition-all duration-300 hover:bg-ed-ink hover:text-ed-bg"
          >
            ‹
          </button>
          <button
            onClick={onNext}
            className="w-10 h-10 border border-ed-rule bg-transparent font-display text-xl text-ed-ink cursor-pointer transition-all duration-300 hover:bg-ed-ink hover:text-ed-bg"
          >
            ›
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-24">
        {/* The solid spine rule */}
        <div className="absolute left-[80px] top-4 bottom-0 w-[2px] bg-ed-rule" />

        {timelineItems.length === 0 ? (
          <div className="py-8 pl-8 text-ed-ink-faint font-ui italic text-sm">
            No scheduled events for this itinerary.
          </div>
        ) : (
          <div className="space-y-6">
            {timelineItems.map((item) => (
              <div key={item.id} className="relative">
                {/* Time Anchor Dot */}
                <div className="absolute -left-[14px] top-2.5 w-3 h-3 rounded-full border-[3px] z-10 bg-ed-ink border-ed-bg" />

                {/* Time Label */}
                <div className="absolute -left-[80px] top-1.5 font-ui text-xs font-semibold text-ed-ink tracking-widest uppercase text-right w-14">
                  {item.startTime}
                </div>

                {/* Content */}
                <div className="pl-6 w-full max-w-sm">
                  {item.isSession ? (
                    <SessionCard session={item as any} />
                  ) : (
                    (() => {
                      const now = new Date();
                      const isToday = now.toDateString() === currentDate.toDateString();
                      const [endH, endM] = item.endTime.split(":").map(Number);
                      const isPassed = isToday && (now.getHours() > endH || (now.getHours() === endH && now.getMinutes() >= endM));

                      return (
                        <div className={`p-3 mb-2 border-l-[3px] bg-ed-paper transition-all duration-300 border border-ed-rule relative group ${isPassed ? "opacity-80 grayscale-[0.5] border-l-ed-rule" : "border-l-ed-gold hover:translate-x-1 cursor-pointer"}`}>
                          <div className="flex justify-between items-start">
                            <p className={`font-ui text-[0.6rem] uppercase tracking-[0.05em] ${isPassed ? "text-ed-rule line-through" : "text-ed-ink-faint"}`}>
                              {item.startTime} — {item.endTime}
                            </p>
                            {isPassed && (
                              <div className="w-3.5 h-3.5 border border-ed-ink bg-ed-ink flex items-center justify-center">
                                <span className="text-ed-bg text-[10px]">✓</span>
                              </div>
                            )}
                          </div>
                          <p className={`font-display font-semibold text-lg mt-1 ${isPassed ? "text-ed-ink-light line-through decoration-ed-rule decoration-2" : "text-ed-ink"}`}>
                            {item.emoji} {item.name}
                          </p>
                          {isPassed && (
                            <div className="mt-1 font-ui text-[0.55rem] uppercase tracking-[0.1em] text-ed-rust font-bold">
                              Passed Completion
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* End of day mark */}
      {timelineItems.length > 0 && (
        <div className="pl-24 mt-6 relative">
          <div className="absolute left-[79px] top-1.5 w-2 h-2 rounded-full border-2 border-ed-rule bg-ed-bg z-10" />
          <p className="font-ui text-xs text-ed-ink-faint italic ml-6">End of itinerary</p>
        </div>
      )}
    </div>
  );
}
