"use client";

import { markSettled } from "@/actions/settlements";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { formatCurrencyPlain } from "@/lib/format";
import { ArrowRight } from "lucide-react";
import { useTransition } from "react";

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

  const handleSettle = () => {
    startTransition(async () => {
      await markSettled(fromId, toId, amount);
    });
  };

  return (
    <div className="card flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="min-w-0">
        <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--text-danger)]">
          Pending
        </div>
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <MemberAvatar name={fromName} emoji={fromEmoji} colorCode={fromColor} />
          <span className="text-[13px] font-medium">{fromName}</span>
          <ArrowRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
          <MemberAvatar name={toName} emoji={toEmoji} colorCode={toColor} />
          <span className="text-[13px] font-medium">{toName}</span>
        </div>
        <div className="text-sm font-semibold tabular-nums text-[var(--text-danger)]">
          {formatCurrencyPlain(amount)}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSettle}
        disabled={isPending}
        className="shrink-0"
      >
        {isPending ? "Saving…" : "Mark settled"}
      </Button>
    </div>
  );
}
