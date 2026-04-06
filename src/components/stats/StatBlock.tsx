interface StatBlockProps {
  value: string;
  suffix?: string;
  caption: string;
}

export default function StatBlock({ value, suffix, caption }: StatBlockProps) {
  return (
    <div className="mb-6 pb-6 border-b border-ed-rule">
      <div className="font-display text-5xl font-black leading-none text-ed-rust">
        {value}
        {suffix && (
          <span className="text-base font-normal text-ed-ink-light">
            {suffix}
          </span>
        )}
      </div>
      <p className="font-ui text-[0.7rem] uppercase tracking-[0.1em] text-ed-ink-light mt-1">
        {caption}
      </p>
    </div>
  );
}
