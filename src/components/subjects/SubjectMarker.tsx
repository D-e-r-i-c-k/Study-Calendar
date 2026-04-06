import type { SubjectColor } from "@/lib/types";

const colorMap: Record<SubjectColor, string> = {
  rust: "bg-ed-rust",
  navy: "bg-ed-navy",
  olive: "bg-ed-olive",
  burgundy: "bg-ed-burgundy",
  gold: "bg-ed-gold",
};

export default function SubjectMarker({ color }: { color: SubjectColor }) {
  return <span className={`inline-block w-2.5 h-2.5 ${colorMap[color]}`} />;
}
