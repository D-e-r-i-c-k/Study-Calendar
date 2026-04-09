"use client";

import { useTransition, useState, useEffect } from "react";
import { toggleSessionCompletion } from "@/app/actions";
import { Check } from "lucide-react";
import type { StudySession } from "@/lib/types";

const borderMap: Record<string, string> = {
  learn: "border-l-ed-rust",
  review: "border-l-ed-navy",
  practice: "border-l-ed-olive",
};

const typeColorMap: Record<string, string> = {
  learn: "text-ed-rust",
  review: "text-ed-navy",
  practice: "text-ed-olive",
};

const typeLabels: Record<string, string> = {
  learn: "New Learning",
  review: "Review",
  practice: "Practice Test",
};

interface SessionCardProps {
  session: any; // Mapped from DB loosely for now
}

import { useRouter } from "next/navigation";

export default function SessionCard({ session }: SessionCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(session.completed);

  // Sync back if server state changes drastically
  useEffect(() => {
    setIsCompleted(session.completed);
  }, [session.completed]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isCompleted;
    setIsCompleted(newState); // Instant UI update

    startTransition(async () => {
      try {
        await toggleSessionCompletion(session.id, newState);
        router.refresh();
      } catch (err) {
        setIsCompleted(!newState); // Revert on failure
      }
    });
  };

  return (
    <div
      onClick={handleToggle}
      className={`
        p-2 mb-2 border-l-[3px] text-left cursor-pointer relative group
        transition-all duration-300 hover:translate-x-1
        ${isCompleted ? "bg-ed-bg opacity-40 grayscale border-l-ed-rule" : "bg-ed-paper"}
        ${!isCompleted ? (borderMap[session.type] || "border-l-ed-gold") : ""}
      `}
    >
      <div className="flex justify-between items-start">
        <p className={`font-ui text-[0.6rem] uppercase tracking-[0.05em] ${isCompleted ? "text-ed-rule line-through" : "text-ed-ink-faint"}`}>
          {session.startTime}
        </p>
        <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors ${isCompleted ? "bg-ed-ink border-ed-ink" : "border-ed-ink-light bg-transparent"}`}>
          {isCompleted && <Check size={10} className="text-ed-bg" />}
        </div>
      </div>
      
      <p className={`font-display font-semibold text-sm mt-0.5 leading-tight ${isCompleted ? "text-ed-ink-light line-through decoration-ed-rule decoration-2" : "text-ed-ink"}`}>
        {session.test.name}
      </p>
      
      <p
        className={`font-ui text-[0.55rem] uppercase tracking-[0.1em] mt-1 font-semibold ${
          isCompleted ? "text-ed-ink-light" : (typeColorMap[session.type] || "text-ed-gold")
        }`}
      >
        {typeLabels[session.type] || session.type}
      </p>

    </div>
  );
}
