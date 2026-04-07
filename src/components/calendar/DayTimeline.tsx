"use client";

import { format } from "date-fns";
import SessionCard from "./SessionCard";
import type { StudySession } from "@/lib/types";

interface DayTimelineProps {
  currentDate: Date;
  sessions: any[];
  extramurals: any[];
  onPrev: () => void;
  onNext: () => void;
}

export default function DayTimeline({ currentDate, sessions, onPrev, onNext }: DayTimelineProps) {
  // Filter sessions strictly for this single day
  const daySessions = sessions
    .filter(s => new Date(s.date).toDateString() === currentDate.toDateString())
    // Sort by start time (assuming "HH:MM" 24h format in string)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="max-w-2xl mx-auto mt-4 pb-12">
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

        {daySessions.length === 0 ? (
          <div className="py-8 pl-8 text-ed-ink-faint font-ui italic text-sm">
            No scheduled sessions for this itinerary.
          </div>
        ) : (
          <div className="space-y-6">
            {daySessions.map((session) => (
              <div key={session.id} className="relative">
                {/* Time Anchor Dot */}
                <div className="absolute -left-[14px] top-2.5 w-3 h-3 rounded-full bg-ed-ink border-[3px] border-ed-bg z-10" />
                
                {/* Time Label */}
                <div className="absolute -left-[80px] top-1.5 font-ui text-xs font-semibold text-ed-ink tracking-widest uppercase text-right w-14">
                  {session.startTime}
                </div>

                {/* Session Content */}
                <div className="pl-6 w-full max-w-sm">
                  <SessionCard session={session} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* End of day mark */}
      {daySessions.length > 0 && (
         <div className="pl-24 mt-6 relative">
             <div className="absolute left-[79px] top-1.5 w-2 h-2 rounded-full border-2 border-ed-rule bg-ed-bg z-10" />
             <p className="font-ui text-xs text-ed-ink-faint italic ml-6">End of itinerary</p>
         </div>
      )}
    </div>
  );
}
