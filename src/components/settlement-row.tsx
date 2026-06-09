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
import { useState, useTransition } from "react";

type SettlementRowProps = {
  fromId: string;
  fromName: string;
  fromEmoji: string;
  fromColor: string;
  toId: string;
  toName: string;
  toEmoji: string;
  toColor: string;
  amount: number;
};

export function SettlementRow({
  fromId,
  fromName,
  fromEmoji,
  fromColor,
  toId,
  toName,
  toEmoji,
  toColor,
  amount,
}: SettlementRowProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (hidden) return null;

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      try {
        await markSettled(fromId, toId, amount);
        setConfirmOpen(false);
        setHidden(true);
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
      <div className="card flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--text-danger)]">
            Pending
          </div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <MemberAvatar
              name={fromName}
              emoji={fromEmoji}
              colorCode={fromColor}
            />
            <span className="text-[13px] font-medium">{fromName}</span>
            <ArrowRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <MemberAvatar name={toName} emoji={toEmoji} colorCode={toColor} />
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          disabled={isPending}
          className="shrink-0 gap-1.5"
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
