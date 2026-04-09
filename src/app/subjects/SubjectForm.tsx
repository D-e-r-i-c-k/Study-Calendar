"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { subjectSchema, type SubjectInput } from "@/lib/validations";
import { createSubject } from "../actions";

const colors = [
  { id: "bg-ed-rust", label: "Rust" },
  { id: "bg-ed-navy", label: "Navy" },
  { id: "bg-ed-olive", label: "Olive" },
  { id: "bg-ed-gold", label: "Gold" },
  { id: "bg-ed-ink", label: "Ink" },
];

export default function SubjectForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    mode: "onChange",
  });

  const selectedColor = watch("color");

  const onSubmit = async (data: SubjectInput) => {
    startTransition(async () => {
      try {
        await createSubject(data);
        router.refresh();
      } catch (err) {
        console.error("Failed to append subject", err);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      <div className="space-y-2">
        <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">
          Department Title
        </label>
        <input 
          {...register("name")}
          type="text" 
          placeholder="e.g. Mathematics"
          className="w-full bg-transparent border-b-2 border-ed-ink focus:outline-none focus:border-ed-rust font-body text-xl py-2 text-ed-ink placeholder:text-ed-ink-faint transition-colors"
        />
        {errors.name && <p className="font-ui text-xs text-ed-rust mt-1">{errors.name.message}</p>}
      </div>

      <div className="space-y-3 pt-2">
        <label className="block font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink">
          Designation Color
        </label>
        <div className="flex flex-wrap gap-3 items-center">
          {colors.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() => setValue("color", color.id as any, { shouldValidate: true })}
              className={`w-6 h-6 border-2 transition-all duration-200 flex-shrink-0 ${color.id} ${
                selectedColor === color.id ? "border-ed-rust scale-110 shadow-sm" : "border-ed-ink/20 opacity-80"
              }`}
              title={color.label}
              aria-label={color.label}
            />
          ))}
          <div className="h-6 w-[2px] bg-ed-rule mx-1" />
          <label className="relative flex items-center cursor-pointer group">
             {/* Native color picker with transparent box styling overridden by Tailwind */}
             <input 
               type="color" 
               title="Custom Color"
               onChange={(e) => setValue("color", e.target.value, { shouldValidate: true })}
               className="w-7 h-7 p-0 border-2 cursor-pointer bg-transparent"
               style={{ 
                 borderColor: selectedColor?.startsWith("#") ? "#D15132" : "rgba(35,31,32,0.2)",
                 backgroundColor: selectedColor?.startsWith("#") ? selectedColor : "#ffffff"
               }}
             />
             <span className="ml-2 font-ui text-[0.65rem] uppercase text-ed-ink-light tracking-wider group-hover:text-ed-ink transition-colors">Custom</span>
          </label>
        </div>
        {errors.color && <p className="font-ui text-xs text-ed-rust mt-1">{errors.color.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending || !isValid}
        className="mt-8 w-full border-2 border-ed-ink py-3 font-ui text-xs uppercase tracking-[0.2em] font-bold text-ed-ink bg-transparent hover:bg-ed-ink hover:text-ed-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Registering..." : `Register Department`}
      </button>
    </form>
  );
}
