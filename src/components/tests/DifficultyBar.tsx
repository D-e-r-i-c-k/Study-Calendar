interface DifficultyBarProps {
  difficulty: number; // 1-10
}

export default function DifficultyBar({ difficulty }: DifficultyBarProps) {
  return (
    <div className="flex gap-0.5 mt-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={`w-[18px] h-1 ${
            i < difficulty ? "bg-ed-rust" : "bg-ed-rule"
          }`}
        />
      ))}
    </div>
  );
}
