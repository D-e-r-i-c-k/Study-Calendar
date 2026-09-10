import type { StreakSummary } from "@/lib/stats";

// Milestones give the run something to aim at. The rust ink is the paper's
// accent colour, held back until a streak is actually worth remarking on.
const TIERS = [
  { at: 30, label: "A month unbroken" },
  { at: 14, label: "A fortnight unbroken" },
  { at: 7, label: "A week unbroken" },
  { at: 3, label: "Finding a rhythm" },
];

interface StreakBannerProps {
  streak: StreakSummary;
}

export default function StreakBanner({ streak }: StreakBannerProps) {
  const tier = TIERS.find((t) => streak.current >= t.at);

  if (streak.current === 0) {
    return (
      <div className="border border-dashed border-ed-rule bg-ed-paper/40 px-4 py-3 mb-4">
        <p className="font-ui text-[0.65rem] uppercase tracking-[0.2em] text-ed-ink-faint font-bold">
          Study Streak
        </p>
        <p className="font-body text-sm text-ed-ink-light mt-1 italic">
          Complete a session today to start a run.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`border px-4 py-3 mb-4 ${
        tier ? "border-ed-rust bg-ed-rust/5" : "border-ed-rule bg-ed-paper/60"
      }`}
    >
      <p className="font-ui text-[0.65rem] uppercase tracking-[0.2em] text-ed-ink-faint font-bold">
        Study Streak
      </p>

      <p className="mt-1 flex items-baseline gap-1.5">
        <span
          className={`font-display text-4xl font-bold leading-none ${
            tier ? "text-ed-rust" : "text-ed-ink"
          }`}
        >
          {streak.current}
        </span>
        <span className="font-ui text-[0.6rem] uppercase tracking-[0.15em] text-ed-ink-light font-bold">
          {streak.current === 1 ? "Day" : "Days"} Running
        </span>
      </p>

      <p className="font-body text-xs text-ed-ink-light mt-1.5 italic">
        {tier
          ? tier.label
          : streak.studiedToday
            ? "Today is on the board."
            : "Study today to keep the run alive."}
      </p>
    </div>
  );
}
