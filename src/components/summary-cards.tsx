import { formatCurrency, formatCurrencyPlain } from "@/lib/format";
import { cn } from "@/lib/utils";

type SummaryCardsProps = {
  totalThisMonth: number;
  monthLabel: string;
  yourShare: number;
  netBalance: number;
  balanceLabel: string;
};

export function SummaryCards({
  totalThisMonth,
  monthLabel,
  yourShare,
  netBalance,
  balanceLabel,
}: SummaryCardsProps) {
  return (
    <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      <div className="card px-4 py-3.5">
        <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          Total this month
        </div>
        <div className="mt-1.5 text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
          {formatCurrencyPlain(totalThisMonth)}
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
          {monthLabel}
        </div>
      </div>
      <div className="card px-4 py-3.5">
        <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          Your share
        </div>
        <div className="mt-1.5 text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
          {formatCurrencyPlain(yourShare)}
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
          of {formatCurrencyPlain(totalThisMonth)}
        </div>
      </div>
      <div className="card px-4 py-3.5">
        <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          {balanceLabel}
        </div>
        <div
          className={cn(
            "mt-1.5 text-2xl font-semibold tabular-nums",
            netBalance > 0.01
              ? "text-[var(--text-success)]"
              : netBalance < -0.01
                ? "text-[var(--text-danger)]"
                : "text-[var(--text-primary)]"
          )}
        >
          {formatCurrency(netBalance)}
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
          net balance
        </div>
      </div>
    </div>
  );
}
