"use client";

import { unsettleBatch } from "@/actions/settlements";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { formatCurrencyPlain } from "@/lib/format";
import { format } from "date-fns";
import { ArrowRight, CheckCircle2, Lock, Undo2 } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";

type SettledBatchRowProps = {
  id: string;
  fromName: string;
  fromEmoji: string;
  fromColor: string;
  toName: string;
  toEmoji: string;
  toColor: string;
  amount: number;
  settledAt: Date;
  canEdit: boolean;
};

export function SettledBatchRow({
  id,
  fromName,
  fromEmoji,
  fromColor,
  toName,
  toEmoji,
  toColor,
  amount,
  settledAt,
  canEdit,
}: SettledBatchRowProps) {
  const [isPending, startTransition] = useTransition();

  const handleUnsettle = () => {
    startTransition(async () => {
      await unsettleBatch(id);
    });
  };

  return (
    <div className="card flex items-center justify-between gap-3 border-[var(--text-success)]/20 bg-[var(--bg-success)]/30 px-4 py-3.5">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-[var(--text-success)]">
          <CheckCircle2 className="h-3 w-3" />
          Settled
        </div>
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <MemberAvatar name={fromName} emoji={fromEmoji} colorCode={fromColor} />
          <span className="text-[13px] font-medium">{fromName}</span>
          <ArrowRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
          <MemberAvatar name={toName} emoji={toEmoji} colorCode={toColor} />
          <span className="text-[13px] font-medium">{toName}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="font-semibold tabular-nums text-[var(--text-primary)]">
            {formatCurrencyPlain(amount)}
          </span>
          <span className="text-[var(--text-secondary)]">
            · {format(new Date(settledAt), "MMM d, h:mm a")}
          </span>
        </div>
      </div>
      {canEdit ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleUnsettle}
          disabled={isPending}
          className="shrink-0 gap-1"
        >
          <Undo2 className="h-3 w-3" />
          {isPending ? "Undoing…" : "Unsettle"}
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="shrink-0 gap-1" asChild>
          <Link href="/login">
            <Lock className="h-3 w-3" />
            Sign in
          </Link>
        </Button>
      )}
    </div>
  );
}
