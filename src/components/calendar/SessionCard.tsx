"use client";

import { useTransition } from "react";
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

  const handleToggle = () => {
    startTransition(async () => {
      // Optimistic update pattern can be added here
      await toggleSessionCompletion(session.id, !session.completed);
      router.refresh();
    });
  };

  return (
    <div
      onClick={handleToggle}
      className={`
        p-2 mb-2 border-l-[3px] text-left cursor-pointer relative group
        transition-all duration-300 hover:translate-x-1
        ${session.completed ? "bg-ed-bg opacity-60 grayscale border-l-ed-rule" : "bg-ed-paper"}
        ${!session.completed ? (borderMap[session.type] || "border-l-ed-gold") : ""}
        ${isPending ? "opacity-50" : ""}
      `}
    >
      <div className="flex justify-between items-start">
        <p className={`font-ui text-[0.6rem] uppercase tracking-[0.05em] ${session.completed ? "text-ed-rule line-through" : "text-ed-ink-faint"}`}>
          {session.startTime}
        </p>
        {session.completed && <Check size={12} className="text-ed-ink-light" />}
      </div>
      
      <p className={`font-display font-semibold text-sm mt-0.5 leading-tight ${session.completed ? "text-ed-ink-light line-through decoration-ed-rule decoration-2" : "text-ed-ink"}`}>
        {session.test.name}
      </p>
      
      <p
        className={`font-ui text-[0.55rem] uppercase tracking-[0.1em] mt-1 font-semibold ${
          session.completed ? "text-ed-ink-light" : (typeColorMap[session.type] || "text-ed-gold")
        }`}
      >
        {typeLabels[session.type] || session.type}
      </p>

      {/* Hover reveal checkmark if not completed */}
      {!session.completed && (
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Check size={14} className="text-ed-ink" />
        </div>
      )}
    </div>
  );
}
