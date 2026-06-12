"use client";

import { SettlementRow } from "@/components/settlement-row";
import { SettlementsHistory } from "@/components/settlements-history";
import { useViewAs } from "@/components/view-as-context";
import type { SettlementWithDetails } from "@/lib/queries";
import { formatCurrencyPlain } from "@/lib/format";
import { CheckCircle2 } from "lucide-react";

type SettleClientProps = {
  transfers: any[];
  settlements: SettlementWithDetails[];
};

export function SettleClient({ transfers, settlements }: SettleClientProps) {
  const { memberId } = useViewAs();

  // Filter transfers to only show pending payments to be done or received by the viewed roommate
  const myTransfers = transfers.filter(
    (t) => t.fromId === memberId || t.toId === memberId
  );

  // Filter settlements history to only show those involving the viewed roommate
  const mySettlements = settlements.filter(
    (s) => s.fromId === memberId || s.toId === memberId
  );

  const youOweTransfers = myTransfers.filter((t) => t.fromId === memberId);
  const owedToYouTransfers = myTransfers.filter((t) => t.toId === memberId);

  const youOwe = youOweTransfers.reduce((sum, t) => sum + t.amount, 0);
  const owedToYou = owedToYouTransfers.reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="card px-3 py-2.5 flex flex-col justify-between">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-danger)]">
            You owe
          </div>
          <div className="mt-1 text-sm font-bold text-[var(--text-danger)] tabular-nums">
            {formatCurrencyPlain(youOwe)}
          </div>
        </div>
        <div className="card px-3 py-2.5 flex flex-col justify-between">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-success)]">
            Owed to you
          </div>
          <div className="mt-1 text-sm font-bold text-[var(--text-success)] tabular-nums">
            {formatCurrencyPlain(owedToYou)}
          </div>
        </div>
        <div className="card px-3 py-2.5 flex flex-col justify-between">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Pending
          </div>
          <div className="mt-1 text-sm font-bold text-[var(--text-primary)]">
            {myTransfers.length}
          </div>
        </div>
      </div>

      {myTransfers.length > 0 ? (
        <div className="space-y-6 mb-8">
          {youOweTransfers.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-danger)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-danger)]" />
                You owe
              </div>
              <div className="flex flex-col gap-2">
                {youOweTransfers.map((t) => (
                  <SettlementRow
                    key={`${t.fromId}-${t.toId}-${t.amount}`}
                    fromId={t.fromId}
                    fromName={t.fromName}
                    fromIcon={t.fromIcon}
                    fromColor={t.fromColor}
                    toId={t.toId}
                    toName={t.toName}
                    toIcon={t.toIcon}
                    toColor={t.toColor}
                    amount={t.amount}
                    breakdown={t.breakdown}
                  />
                ))}
              </div>
            </div>
          )}

          {owedToYouTransfers.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-success)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-success)]" />
                Owed to you
              </div>
              <div className="flex flex-col gap-2">
                {owedToYouTransfers.map((t) => (
                  <SettlementRow
                    key={`${t.fromId}-${t.toId}-${t.amount}`}
                    fromId={t.fromId}
                    fromName={t.fromName}
                    fromIcon={t.fromIcon}
                    fromColor={t.fromColor}
                    toId={t.toId}
                    toName={t.toName}
                    toIcon={t.toIcon}
                    toColor={t.toColor}
                    amount={t.amount}
                    breakdown={t.breakdown}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <CheckCircle2 className="h-10 w-10 text-[var(--text-success)]" />
          <p className="text-[14px] font-medium text-[var(--text-primary)]">
            All settled up
          </p>
          <p className="text-[13px] text-[var(--text-secondary)]">
            No outstanding balances for you.
          </p>
        </div>
      )}

      <SettlementsHistory settlements={mySettlements} />
    </>
  );
}
