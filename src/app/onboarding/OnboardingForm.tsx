"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import { updateUserProfile } from "../actions";

export default function OnboardingForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      grade: initialData?.grade || "11",
      curriculum: initialData?.curriculum || "IEB",
      school: initialData?.school || "",
      schoolEndTime: initialData?.schoolEndTime || "14:30",
      studyEndTime: initialData?.studyEndTime || "18:00",
      dailyBuffer: initialData?.dailyBuffer || 30,
      offDay: initialData?.offDay ?? 0,
    }
  });

  const onSubmit = async (data: ProfileInput) => {
    setIsSuccess(false);
    startTransition(async () => {
      try {
        await updateUserProfile(data);
        setIsSuccess(true);
        router.refresh();
        setTimeout(() => setIsSuccess(false), 3000);
      } catch (err) {
        console.error("Failed to update profile", err);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-12">
      
      {/* 1. Academic Profile */}
      <section>
        <h2 className="font-display text-3xl font-bold text-ed-ink mb-6 border-b border-ed-rule pb-2">I. Academic Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">Grade/Standard</label>
            <input 
              {...register("grade")}
              type="text" 
              className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-body text-xl py-2 text-ed-ink placeholder:text-ed-ink-faint transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">Curriculum</label>
            <input 
              {...register("curriculum")}
              type="text" 
              className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-body text-xl py-2 text-ed-ink placeholder:text-ed-ink-faint transition-colors"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">Institution</label>
            <input 
              {...register("school")}
              type="text" 
              className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-body text-xl py-2 text-ed-ink placeholder:text-ed-ink-faint transition-colors"
            />
            {errors.school && <p className="font-ui text-xs text-ed-rust mt-1">{errors.school.message}</p>}
          </div>
        </div>
      </section>

      {/* 2. Chronological Parameters */}
      <section>
        <h2 className="font-display text-3xl font-bold text-ed-ink mb-6 border-b border-ed-rule pb-2">II. Temporal Constraints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">School End Time</label>
            <input 
              {...register("schoolEndTime")}
              type="time" 
              className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-ui text-xl py-2 text-ed-ink transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">Absolute Sleep Cutoff</label>
            <input 
              {...register("studyEndTime")}
              type="time" 
              className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-ui text-xl py-2 text-ed-ink transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink flex justify-between">
               <span>Buffer & Margins (Minutes)</span>
               <span className="text-ed-ink-light normal-case tracking-normal">Chores, Dinner</span>
            </label>
            <input 
              {...register("dailyBuffer", { valueAsNumber: true })}
              type="number" 
              min="0"
              className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-body text-xl py-2 text-ed-ink transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">Mandatory Rest Day</label>
            <select 
              {...register("offDay", { valueAsNumber: true })}
              className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-body text-xl py-2 text-ed-ink appearance-none cursor-pointer"
            >
              <option value="0">Sunday</option>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
            </select>
          </div>
        </div>
      </section>

      <div className="pt-8 border-t-2 border-ed-ink flex flex-col items-end">
        <button
          type="submit"
          disabled={isPending || !isValid}
          className="w-full md:w-auto px-12 border-2 border-ed-ink py-4 font-ui text-xs uppercase tracking-[0.2em] font-bold text-ed-ink hover:text-ed-bg hover:bg-ed-ink transition-colors disabled:opacity-50"
        >
          {isPending ? "Engraving Parameters..." : `Save Master Preferences`}
        </button>
        {isSuccess && (
          <p className="font-ui text-sm italic text-ed-rust mt-4 slide-in-from-bottom-2 fade-in duration-300">
             Parameters successfully updated.
          </p>
        )}
      </div>
    </form>
  );
}
