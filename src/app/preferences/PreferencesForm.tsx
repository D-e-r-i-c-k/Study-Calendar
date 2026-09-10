"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { preferencesSchema, type PreferencesInput } from "@/lib/validations";
import { SCHEDULER_DEFAULTS } from "@/lib/scheduler-defaults";
import { updateUserProfile } from "../actions";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const fieldClass =
  "w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-body text-xl py-2 text-ed-ink transition-colors";

// Only the columns this form owns; the rest of the User row is irrelevant here.
type PreferencesInitialData = Partial<{
  sessionMinutes: number | null;
  breakMinutes: number | null;
  maxSessionsPerDay: number | null;
  maxSubjectsPerDay: number | null;
  weekendStartTime: string | null;
  offDay: number | null;
  spacingOffsets: string | null;
}> | null;

export default function PreferencesForm({ initialData }: { initialData: PreferencesInitialData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<PreferencesInput>({
    resolver: zodResolver(preferencesSchema),
    mode: "onChange",
    defaultValues: {
      sessionMinutes: initialData?.sessionMinutes ?? SCHEDULER_DEFAULTS.sessionMinutes,
      breakMinutes: initialData?.breakMinutes ?? SCHEDULER_DEFAULTS.breakMinutes,
      maxSessionsPerDay: initialData?.maxSessionsPerDay ?? SCHEDULER_DEFAULTS.maxSessionsPerDay,
      maxSubjectsPerDay: initialData?.maxSubjectsPerDay ?? SCHEDULER_DEFAULTS.maxSubjectsPerDay,
      weekendStartTime: initialData?.weekendStartTime ?? SCHEDULER_DEFAULTS.weekendStartTime,
      offDay: initialData?.offDay ?? SCHEDULER_DEFAULTS.offDay,
      spacingOffsets: initialData?.spacingOffsets ?? SCHEDULER_DEFAULTS.spacingOffsets,
    },
  });

  const sessionMinutes = watch("sessionMinutes");
  const breakMinutes = watch("breakMinutes");
  const maxSessionsPerDay = watch("maxSessionsPerDay");

  const onSubmit = async (data: PreferencesInput) => {
    setIsSuccess(false);
    startTransition(async () => {
      try {
        await updateUserProfile(data);
        setIsSuccess(true);
        router.refresh();
        setTimeout(() => setIsSuccess(false), 3000);
      } catch (err) {
        console.error("Failed to update preferences", err);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-12">
      {/* 1. Focus rhythm */}
      <section>
        <h2 className="font-display text-3xl font-bold text-ed-ink mb-6 border-b border-ed-rule pb-2">
          I. Focus Rhythm
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">
              Focus Block (Minutes)
            </label>
            <input {...register("sessionMinutes", { valueAsNumber: true })} type="number" min="15" max="60" className={fieldClass} />
            {errors.sessionMinutes && <p className="font-ui text-xs text-ed-rust mt-1">{errors.sessionMinutes.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">
              Break (Minutes)
            </label>
            <input {...register("breakMinutes", { valueAsNumber: true })} type="number" min="0" max="15" className={fieldClass} />
            {errors.breakMinutes && <p className="font-ui text-xs text-ed-rust mt-1">{errors.breakMinutes.message}</p>}
          </div>
        </div>
        <p className="font-body text-sm italic text-ed-ink-light mt-4">
          Each slot occupies {(sessionMinutes || 0) + (breakMinutes || 0)} minutes of the evening —{" "}
          {sessionMinutes || 0} studying, {breakMinutes || 0} resting.
        </p>
      </section>

      {/* 2. Daily ceiling */}
      <section>
        <h2 className="font-display text-3xl font-bold text-ed-ink mb-6 border-b border-ed-rule pb-2">
          II. Daily Ceiling
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">
              Max Sessions Per Day
            </label>
            <input {...register("maxSessionsPerDay", { valueAsNumber: true })} type="number" min="1" max="12" className={fieldClass} />
            {errors.maxSessionsPerDay && <p className="font-ui text-xs text-ed-rust mt-1">{errors.maxSessionsPerDay.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink flex justify-between">
              <span>Max Subjects Per Day</span>
              <span className="text-ed-ink-light normal-case tracking-normal">Interleaving breadth</span>
            </label>
            <input {...register("maxSubjectsPerDay", { valueAsNumber: true })} type="number" min="1" max="5" className={fieldClass} />
            {errors.maxSubjectsPerDay && <p className="font-ui text-xs text-ed-rust mt-1">{errors.maxSubjectsPerDay.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">
              Weekend Start Time
            </label>
            <input {...register("weekendStartTime")} type="time" className={`${fieldClass} font-ui`} />
            {errors.weekendStartTime && <p className="font-ui text-xs text-ed-rust mt-1">{errors.weekendStartTime.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">
              Mandatory Rest Day
            </label>
            <select
              {...register("offDay", { valueAsNumber: true })}
              className={`${fieldClass} appearance-none cursor-pointer`}
            >
              {DAYS.map((day, index) => (
                <option key={day} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="font-body text-sm italic text-ed-ink-light mt-4">
          A ceiling of {maxSessionsPerDay || 0} slots caps you at roughly{" "}
          {Math.round((((maxSessionsPerDay || 0) * (sessionMinutes || 0)) / 60) * 10) / 10} hours of focused study a day.
        </p>
      </section>

      {/* 3. Spaced repetition */}
      <section>
        <h2 className="font-display text-3xl font-bold text-ed-ink mb-6 border-b border-ed-rule pb-2">
          III. Repetition Curve
        </h2>
        <div className="space-y-2">
          <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink flex justify-between">
            <span>Spacing Offsets (Days Before Test)</span>
            <span className="text-ed-ink-light normal-case tracking-normal">Comma separated</span>
          </label>
          <input {...register("spacingOffsets")} type="text" placeholder="1,2,4,7,10" className={fieldClass} />
          {errors.spacingOffsets && <p className="font-ui text-xs text-ed-rust mt-1">{errors.spacingOffsets.message}</p>}
          <p className="font-body text-sm italic text-ed-ink-light pt-2">
            Each number is a rehearsal counted backwards from the examination date. The default curve —
            1, 2, 4, 7, 10 — follows the standard forgetting-curve intervals.
          </p>
        </div>
      </section>

      <div className="pt-8 border-t-2 border-ed-ink flex flex-col items-end">
        <button
          type="submit"
          disabled={isPending || !isValid}
          className="w-full md:w-auto px-12 border-2 border-ed-ink py-4 font-ui text-xs uppercase tracking-[0.2em] font-bold text-ed-ink hover:text-ed-bg hover:bg-ed-ink transition-colors disabled:opacity-50"
        >
          {isPending ? "Recalibrating Engine..." : "Save Engine Preferences"}
        </button>
        {isSuccess && (
          <p className="font-ui text-sm italic text-ed-rust mt-4 slide-in-from-bottom-2 fade-in duration-300">
            Preferences successfully recalibrated.
          </p>
        )}
      </div>
    </form>
  );
}
