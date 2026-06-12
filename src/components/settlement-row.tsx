"use client";

import { markSettled } from "@/actions/settlements";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrencyPlain } from "@/lib/format";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useViewAs } from "@/components/view-as-context";

type SettlementRowProps = {
  fromId: string;
  fromName: string;
  fromIcon: string;
  fromColor: string;
  toId: string;
  toName: string;
  toIcon: string;
  toColor: string;
  amount: number;
  breakdown?: {
    description: string;
    amount: number;
    date: string;
    isPositive: boolean;
  }[];
};

export function SettlementRow({
  fromId,
  fromName,
  fromIcon,
  fromColor,
  toId,
  toName,
  toIcon,
  toColor,
  amount,
  breakdown,
}: SettlementRowProps) {
  const router = useRouter();
  const { memberId } = useViewAs();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSettle = memberId === fromId;

  if (hidden) return null;

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      try {
        await markSettled(fromId, toId, amount);
        setConfirmOpen(false);
        setHidden(true);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not record settlement. Try again."
        );
      }
    });
  };

  return (
    <>
      <div className="card flex flex-col gap-3 px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--text-danger)]">
              Pending
            </div>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <MemberAvatar
                name={fromName}
                iconName={fromIcon}
                colorCode={fromColor}
              />
              <span className="text-[13px] font-medium">{fromName}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <MemberAvatar name={toName} iconName={toIcon} colorCode={toColor} />
              <span className="text-[13px] font-medium">{toName}</span>
            </div>
            <div className="text-sm font-semibold tabular-nums text-[var(--text-danger)]">
              {formatCurrencyPlain(amount)}
            </div>
            {error && !confirmOpen && (
              <p className="mt-1.5 text-[11px] text-[var(--text-danger)]">
                {error}
              </p>
            )}
          </div>
          {canSettle ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              disabled={isPending}
              className="shrink-0 gap-1.5 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Mark settled"
              )}
            </Button>
          ) : (
            <span className="text-[11px] font-medium text-[var(--text-success)] italic shrink-0">
              Owed to you
            </span>
          )}
        </div>

        {breakdown && breakdown.length > 0 && (
          <div className="mt-1 border-t border-[var(--border-color)]/60 pt-3">
            <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Calculation breakdown
            </div>
            <div className="space-y-1.5">
              {breakdown.map((item, idx) => {
                const itemDate = new Date(item.date);
                const isValidDate = !isNaN(itemDate.getTime());
                const dateString = isValidDate
                  ? itemDate.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "";

                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center gap-3 text-[12px] bg-[var(--background-soft)]/30 hover:bg-[var(--background-soft)]/60 transition-colors px-2.5 py-1.5 rounded-lg border border-[var(--border-color)]/30"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--text-primary)] truncate">
                        {item.description}
                      </div>
                      {dateString && (
                        <div className="text-[9px] text-[var(--text-secondary)] mt-0.5">
                          {dateString}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`font-semibold tabular-nums text-[12px] ${
                          item.isPositive
                            ? "text-[var(--text-danger)]"
                            : "text-[var(--text-success)]"
                        }`}
                      >
                        {item.isPositive ? "+" : "-"}{formatCurrencyPlain(item.amount)}
                      </div>
                      <div className="text-[9px] text-[var(--text-secondary)] mt-0.5">
                        {item.isPositive
                          ? `Owed to ${toName}`
                          : `Owed to ${fromName} / Paid`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm settlement</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">
              {fromName}
            </span>{" "}
            paid{" "}
            <span className="font-medium text-[var(--text-primary)]">
              {toName}
            </span>{" "}
            {formatCurrencyPlain(amount)}
          </p>
          <p className="text-[12px] text-[var(--text-secondary)]">
            This cannot be undone.
          </p>
          {error && (
            <p className="text-[12px] text-[var(--text-danger)]">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button size="sm" onClick={handleConfirm} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Yes, mark settled"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
