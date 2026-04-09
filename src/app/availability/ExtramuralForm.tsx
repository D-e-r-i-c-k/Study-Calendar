"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { extramuralSchema, type ExtramuralInput } from "@/lib/validations";
import { createExtramural } from "../actions";

const DAYS_OF_WEEK = [
  { id: 1, label: "M" },
  { id: 2, label: "T" },
  { id: 3, label: "W" },
  { id: 4, label: "T" },
  { id: 5, label: "F" },
  { id: 6, label: "S" },
  { id: 0, label: "S" },
];

export default function ExtramuralForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<ExtramuralInput>({
    resolver: zodResolver(extramuralSchema),
    mode: "onChange",
    defaultValues: {
      days: [],
    }
  });

  const selectedDays = watch("days");

  const toggleDay = (dayId: number) => {
    let newDays = [...selectedDays];
    if (newDays.includes(dayId)) {
      newDays = newDays.filter((d) => d !== dayId);
    } else {
      newDays.push(dayId);
    }
    setValue("days", newDays, { shouldValidate: true });
  };

  const onSubmit = async (data: ExtramuralInput) => {
    startTransition(async () => {
      try {
        await createExtramural(data);
        router.refresh();
      } catch (err) {
        console.error("Failed to append availability block", err);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
      
      <div className="space-y-4 pt-2">
        <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink text-center mb-2">
          Recurring Trajectory
        </label>
        <div className="flex justify-between w-full border-y border-ed-rule py-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDays.includes(day.id);
            return (
              <button
                key={`day-${day.id}`}
                type="button"
                onClick={() => toggleDay(day.id)}
                className={`w-10 h-10 border rounded-full font-display text-lg tracking-tight transition-all duration-200 ${
                  isSelected 
                    ? "bg-ed-ink text-ed-bg border-ed-ink shadow-[0_2px_4px_rgba(0,0,0,0.2)]" 
                    : "bg-transparent text-ed-ink-light border-transparent hover:border-ed-rule hover:text-ed-ink"
                }`}
              >
                {day.label}
              </button>
            )
          })}
        </div>
        {errors.days && <p className="font-ui text-xs text-ed-rust mt-1 text-center">{errors.days.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">
          Block Designation
        </label>
        <div className="flex items-center gap-4">
          <input 
            {...register("emoji")}
            type="text" 
            placeholder="📅"
            maxLength={2}
            className="w-12 text-center bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-body text-xl py-2"
          />
          <input 
            {...register("name")}
            type="text" 
            placeholder="e.g. Rugby Practice, Chores"
            className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-body text-xl py-2 text-ed-ink placeholder:text-ed-ink-faint transition-colors"
          />
        </div>
        {errors.name && <p className="font-ui text-xs text-ed-rust mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">
            Commencement
          </label>
          <input 
            {...register("startTime")}
            type="time" 
            className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-ui text-lg py-2 text-ed-ink transition-colors"
          />
          {errors.startTime && <p className="font-ui text-xs text-ed-rust mt-1">{errors.startTime.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink flex justify-between">
            <span>Conclusion</span>
          </label>
          <input 
            {...register("endTime")}
            type="time" 
            className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-ui text-lg py-2 text-ed-ink transition-colors"
          />
          {errors.endTime && <p className="font-ui text-xs text-ed-rust mt-1">{errors.endTime.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !isValid}
        className="mt-8 w-full border-2 border-ed-ink py-4 font-ui text-xs uppercase tracking-[0.2em] font-bold text-ed-ink bg-transparent hover:bg-ed-ink hover:text-ed-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Engraving Block..." : `Register Censor Block`}
      </button>
    </form>
  );
}
