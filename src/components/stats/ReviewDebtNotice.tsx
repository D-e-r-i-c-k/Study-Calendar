import type { ReviewDebtSummary } from "@/app/actions";

interface ReviewDebtNoticeProps {
  debt: ReviewDebtSummary;
}

/**
 * Missed work is rolled forward silently, which is the right default — but the
 * student should still be told their calendar changed underneath them, and why.
 */
export default function ReviewDebtNotice({ debt }: ReviewDebtNoticeProps) {
  if (debt.carried === 0 && debt.stranded === 0) return null;

  return (
    <div className="border-l-[3px] border-l-ed-rust bg-ed-paper/60 border border-ed-rule px-4 py-3 mb-4">
      <p className="font-ui text-[0.65rem] uppercase tracking-[0.2em] text-ed-ink-light font-bold">
        Review Debt
      </p>

      {debt.carried > 0 && (
        <p className="font-body text-sm text-ed-ink mt-1">
          {debt.carried} missed {debt.carried === 1 ? "session has" : "sessions have"} been
          folded back into the prep time you have left.
        </p>
      )}

      {debt.stranded > 0 && (
        <p className="font-body text-sm text-ed-ink-light mt-1 italic">
          {debt.stranded} other {debt.stranded === 1 ? "session was" : "sessions were"} missed
          before an examination you have already sat — left on the record.
        </p>
      )}
    </div>
  );
}
