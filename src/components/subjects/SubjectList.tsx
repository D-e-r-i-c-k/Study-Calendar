import type { Subject } from "@/lib/types";
import SubjectMarker from "./SubjectMarker";

interface SubjectListProps {
  subjects: Subject[];
}

export default function SubjectList({ subjects }: SubjectListProps) {
  return (
    <ul className="list-none mb-8">
      {subjects.map((subject) => (
        <li
          key={subject.id}
          className="flex items-center gap-2.5 py-2 border-b border-dotted border-ed-rule text-[0.85rem] cursor-pointer hover:text-ed-rust transition-colors"
        >
          <SubjectMarker color={subject.color} />
          <span className="font-body">{subject.name}</span>
        </li>
      ))}
    </ul>
  );
}
