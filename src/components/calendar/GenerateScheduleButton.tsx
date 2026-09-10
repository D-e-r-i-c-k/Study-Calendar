"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { regenerateSchedule, type RegenerateSummary } from "@/app/actions";

type Phase = "idle" | "confirming" | "done" | "error";

export default function GenerateScheduleButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<Phase>("idle");
  const [summary, setSummary] = useState<RegenerateSummary | null>(null);

  const run = () => {
    startTransition(async () => {
      try {
        const result = await regenerateSchedule();
        setSummary(result);
        setPhase("done");
        router.refresh();
      } catch {
        setPhase("error");
      }
    });
  };

  const buttonClass = compact
    ? "w-full bg-ed-ink text-ed-bg font-ui text-xs font-semibold uppercase tracking-wider px-3 py-2 border border-ed-ink hover:bg-ed-rust hover:border-ed-rust transition-colors cursor-pointer disabled:opacity-50"
    : "bg-ed-ink text-ed-bg font-ui text-xs font-semibold uppercase tracking-wider px-3 py-1.5 border border-ed-ink hover:bg-ed-rust hover:border-ed-rust transition-colors cursor-pointer disabled:opacity-50";

  if (phase === "confirming") {
    return (
      <div className={`border border-ed-rust bg-ed-rust/5 p-3 ${compact ? "" : "max-w-sm"}`}>
        <p className="font-ui text-[0.65rem] uppercase tracking-wider font-bold text-ed-ink mb-2">
          Rebuild the timeline?
        </p>
        <p className="font-body text-sm text-ed-ink-light mb-3 leading-snug">
          Every future session you have not yet ticked off will be regenerated from your exams and
          availability. Completed work and past days are left alone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={run}
            disabled={isPending}
            className="bg-ed-ink text-ed-bg font-ui text-[0.65rem] font-semibold uppercase tracking-wider px-3 py-1.5 hover:bg-ed-rust transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPending ? "Computing..." : "Rebuild"}
          </button>
          <button
            onClick={() => setPhase("idle")}
            disabled={isPending}
            className="border border-ed-rule font-ui text-[0.65rem] font-semibold uppercase tracking-wider px-3 py-1.5 text-ed-ink-light hover:text-ed-ink hover:border-ed-ink transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "flex items-center gap-3"}>
      <button
        onClick={() => setPhase("confirming")}
        disabled={isPending}
        className={buttonClass}
      >
        Generate Schedule
      </button>

      {phase === "done" && summary && (
        <p className={`font-ui text-[0.65rem] text-ed-ink-light leading-snug ${compact ? "mt-2" : ""}`}>
          <span className="text-ed-rust font-bold">{summary.created}</span> sessions across{" "}
          {summary.daysCovered} days
          {summary.preserved > 0 && <> · {summary.preserved} completed kept</>}
          {summary.unplaced > 0 && (
            <>
              {" "}· <span className="text-ed-rust">{summary.unplaced} could not fit</span> — lengthen
              prep days or raise the daily ceiling
            </>
          )}
        </p>
      )}

      {phase === "error" && (
        <p className={`font-ui text-[0.65rem] text-ed-rust ${compact ? "mt-2" : ""}`}>
          Generation failed. Check that a profile and at least one subject exist.
        </p>
      )}
    </div>
  );
}
