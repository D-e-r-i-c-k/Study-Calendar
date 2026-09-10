import { resolveSubjectColor } from "@/lib/utils";

// Supports bare palette names, Tailwind-style classes and custom hex strings.
export default function SubjectMarker({ color }: { color: string }) {
  const { className, style } = resolveSubjectColor(color, "bg");

  return <span className={`inline-block w-2.5 h-2.5 ${className}`} style={style} />;
}
