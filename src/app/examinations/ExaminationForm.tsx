"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { examinationSchema, type ExaminationInput } from "@/lib/validations";
import { createExamination } from "../actions";

interface Subject {
  id: string;
  name: string;
}

export default function ExaminationForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<ExaminationInput>({
    resolver: zodResolver(examinationSchema),
    mode: "onChange",
    defaultValues: {
      difficulty: 5,
      prepDays: 7,
    }
  });

  const onSubmit = async (data: ExaminationInput) => {
    startTransition(async () => {
      try {
        await createExamination(data);
        router.refresh();
      } catch (err) {
        console.error("Failed to register examination", err);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      
      <div className="space-y-2">
        <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">
          Subject Affiliation
        </label>
        <select 
          {...register("subjectId")}
          className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-body text-xl py-2 text-ed-ink appearance-none cursor-pointer"
        >
          <option value="">Select a Subject...</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.subjectId && <p className="font-ui text-xs text-ed-rust mt-1">{errors.subjectId.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">
          Examination Title
        </label>
        <input 
          {...register("name")}
          type="text" 
          placeholder="e.g. Midterm 1"
          className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-body text-xl py-2 text-ed-ink placeholder:text-ed-ink-faint transition-colors"
        />
        {errors.name && <p className="font-ui text-xs text-ed-rust mt-1">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">
          Scheduled Date
        </label>
        <input 
          {...register("date", { valueAsDate: true })}
          type="date" 
          className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-ui text-lg py-2 text-ed-ink transition-colors"
        />
        {errors.date && <p className="font-ui text-xs text-ed-rust mt-1">{errors.date.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink flex justify-between">
          <span>Difficulty Mapping (1-10)</span>
          <span className="text-ed-rust">Core Metric</span>
        </label>
        <input 
          {...register("difficulty", { valueAsNumber: true })}
          type="range" 
          min="1" max="10"
          className="w-full mt-2 accent-ed-ink"
        />
      </div>

      <div className="space-y-2">
        <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">
          Preparation Advance (Days)
        </label>
        <input 
          {...register("prepDays", { valueAsNumber: true })}
          type="number" 
          min="1" max="30"
          className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-ui text-lg py-2 text-ed-ink transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !isValid}
        className="mt-8 w-full border-2 border-ed-ink py-3 font-ui text-xs uppercase tracking-[0.2em] font-bold text-ed-ink bg-transparent hover:bg-ed-ink hover:text-ed-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Registering..." : `Register Examination`}
      </button>
    </form>
  );
}
