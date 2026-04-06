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
  session: StudySession;
}

export default function SessionCard({ session }: SessionCardProps) {
  return (
    <div
      className={`
        p-2 mb-2 border-l-[3px] bg-ed-paper text-left cursor-pointer
        transition-transform duration-300 hover:translate-x-1
        ${borderMap[session.type] || "border-l-ed-gold"}
      `}
    >
      <p className="font-ui text-[0.6rem] text-ed-ink-faint uppercase tracking-[0.05em]">
        {session.startTime}
      </p>
      <p className="font-display font-semibold text-sm mt-0.5 leading-tight">
        {session.test.name}
      </p>
      <p
        className={`font-ui text-[0.55rem] uppercase tracking-[0.1em] mt-1 font-semibold ${
          typeColorMap[session.type] || "text-ed-gold"
        }`}
      >
        {typeLabels[session.type] || session.type}
      </p>
    </div>
  );
}
