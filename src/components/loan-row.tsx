"use client";

import { repayPersonalLoan, deletePersonalLoan, deletePersonalLoanRepayment } from "@/actions/personal-debts";
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
import { useViewAs } from "@/components/view-as-context";
import type { PersonalDebtWithDetails } from "@/lib/personal-debt";
import { format } from "date-fns";
import { ArrowRight, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type LoanRowProps = {
  debt: PersonalDebtWithDetails;
};

export function LoanRow({ debt }: LoanRowProps) {
  const router = useRouter();
  const { memberId } = useViewAs();
  const [isPending, startTransition] = useTransition();
  const [repayOpen, setRepayOpen] = useState(false);
  const [repayAmount, setRepayAmount] = useState(debt.remaining.toString());
  const [error, setError] = useState<string | null>(null);

  const isBorrower = memberId === debt.borrowerId;
  const canRepay = isBorrower && debt.remaining > 0.01;

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
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Repayment failed");
      }
    });
  };

  const handleDeleteLoan = () => {
    if (!confirm("Are you sure you want to delete this loan? This will delete all payments associated with it.")) return;
    startTransition(async () => {
      try {
        await deletePersonalLoan(debt.id);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete loan");
      }
    });
  };

  const handleDeleteRepayment = (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this repayment?")) return;
    startTransition(async () => {
      try {
        await deletePersonalLoanRepayment(paymentId);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete repayment");
      }
    });
  };

  return (
    <>
      <div className="card px-4 py-3.5">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <MemberAvatar
            name={debt.lenderName}
            iconName={debt.lenderIcon}
            colorCode={debt.lenderColor}
          />
          <span className="text-[13px] font-medium">{debt.lenderName}</span>
          <span className="text-[11px] text-[var(--text-secondary)]">lent</span>
          <ArrowRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
          <MemberAvatar
            name={debt.borrowerName}
            iconName={debt.borrowerIcon}
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
              {format(new Date(debt.createdAt), "MMM d, yyyy")}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteLoan}
              disabled={isPending}
              className="text-[var(--text-danger)] hover:bg-[var(--text-danger)]/5 border-transparent hover:border-[var(--text-danger)]/20 cursor-pointer"
              title="Delete loan"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            {canRepay && (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => {
                  setRepayAmount(debt.remaining.toString());
                  setError(null);
                  setRepayOpen(true);
                }}
                disabled={isPending}
              >
                Record repayment
              </Button>
            )}
          </div>
        </div>

        {debt.payments.length > 0 && (
          <div className="mt-3 border-t border-[var(--border-t)] pt-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Repayments History
            </div>
            <div className="space-y-1.5">
              {debt.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-[12px] text-[var(--text-secondary)]"
                >
                  <span>
                    Repaid {formatCurrencyPlain(p.amount)} on {format(new Date(p.paidAt), "MMM d, yyyy h:mm a")}
                  </span>
                  {isBorrower && (
                    <button
                      onClick={() => handleDeleteRepayment(p.id)}
                      disabled={isPending}
                      className="text-[var(--text-danger)] hover:underline ml-2 cursor-pointer disabled:opacity-50 font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={repayOpen} onOpenChange={setRepayOpen}>
        <DialogContent className="max-w-sm p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base font-semibold">Record repayment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-[var(--bg-secondary)]/50 p-3 text-xs text-[var(--text-secondary)] leading-relaxed">
              <span className="font-semibold text-[var(--text-primary)]">{debt.borrowerName}</span> is paying back <span className="font-semibold text-[var(--text-primary)]">{debt.lenderName}</span>.
              <div className="mt-1">Remaining balance: <span className="font-semibold text-[var(--text-primary)]">{formatCurrencyPlain(debt.remaining)}</span></div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="repay-amount" className="text-xs font-medium text-[var(--text-secondary)]">Amount to repay (₹)</Label>
              <div className="flex gap-2">
                <Input
                  id="repay-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={debt.remaining}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 cursor-pointer text-xs"
                  onClick={() => setRepayAmount(debt.remaining.toString())}
                >
                  Pay max
                </Button>
              </div>
            </div>
            {error && (
              <p className="text-[12px] font-medium text-[var(--text-danger)]">{error}</p>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-tertiary)]">
              <DialogClose asChild>
                <Button variant="outline" size="sm" disabled={isPending} className="cursor-pointer">
                  Cancel
                </Button>
              </DialogClose>
              <Button size="sm" onClick={handleRepay} disabled={isPending} className="cursor-pointer">
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Saving…
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
