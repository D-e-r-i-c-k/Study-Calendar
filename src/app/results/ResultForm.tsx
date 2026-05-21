"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTestResult } from "@/app/actions";

interface ResultFormProps {
  testId: string;
  initialResult: string | null;
}

export default function ResultForm({ testId, initialResult }: ResultFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(!initialResult);
  const [result, setResult] = useState(initialResult || "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        let finalResult = result.trim();
        if (finalResult && !finalResult.endsWith("%")) {
          finalResult = `${finalResult}%`;
        }
        await updateTestResult(testId, finalResult || null);
        setIsEditing(false);
        router.refresh();
      } catch (err) {
        console.error("Failed to update result", err);
      }
    });
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between gap-4">
        <span className="font-display text-2xl font-bold text-ed-rust">
          {initialResult}
        </span>
        <button
          onClick={() => setIsEditing(true)}
          className="font-ui text-[0.6rem] uppercase tracking-wider text-ed-ink-light hover:text-ed-ink transition-colors border border-ed-rule px-2 py-1 bg-transparent hover:bg-ed-paper cursor-pointer"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          max="100"
          placeholder="0-100"
          value={result.replace("%", "")}
          onChange={(e) => {
            const val = e.target.value;
            setResult(val ? `${val}%` : "");
          }}
          disabled={isPending}
          className="w-16 bg-transparent border-b border-ed-ink focus:outline-none focus:border-ed-rust font-ui text-sm py-1 px-1 text-ed-ink placeholder:text-ed-ink-faint transition-colors text-right"
        />
        <span className="font-ui text-sm text-ed-ink">%</span>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="font-ui text-[0.6rem] uppercase tracking-wider text-ed-ink border border-ed-ink px-2.5 py-1 bg-transparent hover:bg-ed-ink hover:text-ed-bg transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isPending ? "..." : "Save"}
      </button>
      {initialResult && (
        <button
          type="button"
          onClick={() => {
            setResult(initialResult);
            setIsEditing(false);
          }}
          disabled={isPending}
          className="font-ui text-[0.6rem] uppercase tracking-wider text-ed-rust hover:text-ed-ink transition-colors px-1 cursor-pointer"
        >
          Cancel
        </button>
      )}
    </form>
  );
}
