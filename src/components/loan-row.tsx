"use client";

import { repayPersonalLoan } from "@/actions/personal-debts";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrencyPlain } from "@/lib/format";
import type { PersonalDebtWithDetails } from "@/lib/personal-debt";
import { format } from "date-fns";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type LoanRowProps = {
  debt: PersonalDebtWithDetails;
};

export function LoanRow({ debt }: LoanRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [repayOpen, setRepayOpen] = useState(false);
  const [repayAmount, setRepayAmount] = useState(debt.remaining.toString());
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  const handleRepay = () => {
    setError(null);
    const parsed = parseFloat(repayAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid amount");
      return;
    }

    startTransition(async () => {
      try {
        await repayPersonalLoan(debt.id, parsed);
        setRepayOpen(false);
        if (parsed >= debt.remaining - 0.01) {
          setHidden(true);
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Repayment failed");
      }
    });
  };

  return (
    <>
      <div className="card px-4 py-3.5">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <MemberAvatar
            name={debt.lenderName}
            emoji={debt.lenderEmoji}
            colorCode={debt.lenderColor}
          />
          <span className="text-[13px] font-medium">{debt.lenderName}</span>
          <span className="text-[11px] text-[var(--text-secondary)]">lent</span>
          <ArrowRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
          <MemberAvatar
            name={debt.borrowerName}
            emoji={debt.borrowerEmoji}
            colorCode={debt.borrowerColor}
          />
          <span className="text-[13px] font-medium">{debt.borrowerName}</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-lg font-semibold tabular-nums text-[var(--text-primary)]">
              {formatCurrencyPlain(debt.remaining)}
              <span className="ml-1.5 text-[12px] font-normal text-[var(--text-secondary)]">
                remaining
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
              {formatCurrencyPlain(debt.principal)} loaned
              {debt.repaid > 0.01 &&
                ` · ${formatCurrencyPlain(debt.repaid)} repaid`}
              {debt.note && ` · ${debt.note}`}
              {" · "}
              {format(new Date(debt.createdAt), "MMM d")}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRepayAmount(debt.remaining.toString());
              setError(null);
              setRepayOpen(true);
            }}
            disabled={isPending}
          >
            Record repayment
          </Button>
        </div>
      </div>

      <Dialog open={repayOpen} onOpenChange={setRepayOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record repayment</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-[var(--text-secondary)]">
            {debt.borrowerName} repays {debt.lenderName}. Remaining:{" "}
            {formatCurrencyPlain(debt.remaining)}
          </p>
          <div className="flex flex-col gap-1">
            <Label htmlFor="repay-amount">Amount (₹)</Label>
            <Input
              id="repay-amount"
              type="number"
              step="0.01"
              min="0"
              max={debt.remaining}
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => setRepayAmount(debt.remaining.toString())}
          >
            Pay full remaining
          </Button>
          {error && (
            <p className="text-[12px] text-[var(--text-danger)]">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button size="sm" onClick={handleRepay} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Confirm repayment"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
