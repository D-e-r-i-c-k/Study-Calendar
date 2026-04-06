import type { Subject, Test } from "@/lib/types";
import SubjectList from "@/components/subjects/SubjectList";
import TestEntry from "@/components/tests/TestEntry";

interface SidebarProps {
  subjects: Subject[];
  tests: Test[];
}

export default function Sidebar({ subjects, tests }: SidebarProps) {
  return (
    <aside className="border-r border-ed-rule p-6 min-w-[240px]">
      <div className="section-head">Departments</div>
      <SubjectList subjects={subjects} />

      <div className="section-head">Forthcoming Examinations</div>
      {tests.map((test) => (
        <TestEntry key={test.id} test={test} />
      ))}
    </aside>
  );
}
