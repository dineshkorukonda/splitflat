import { SettledBatchRow } from "@/components/settled-batch-row";
import { SettlementRow } from "@/components/settlement-row";
import { isAuthenticated } from "@/lib/auth";
import { getMinimizedTransfers, getSettledBatches } from "@/lib/queries";
import { CheckCircle2 } from "lucide-react";

export default async function SettlePage() {
  const [transfers, settledBatches, canEdit] = await Promise.all([
    getMinimizedTransfers(),
    getSettledBatches(),
    isAuthenticated(),
  ]);

  const allClear = transfers.length === 0 && settledBatches.length === 0;

  return (
    <>
      <div className="mb-4">
        <div className="card flex items-center justify-between px-4 py-3.5">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Outstanding balances
            </div>
            <div className="mt-1 text-base font-semibold text-[var(--text-primary)]">
              {transfers.length === 0
                ? "Nothing pending"
                : `${transfers.length} pending settlement${transfers.length === 1 ? "" : "s"}`}
            </div>
          </div>
          {transfers.length > 0 && (
            <div className="text-[12px] text-[var(--text-secondary)]">
              Fewest transfers
            </div>
          )}
        </div>
      </div>

      {transfers.length > 0 && (
        <>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            Who pays whom
          </div>
          <div className="mb-6 flex flex-col gap-2">
            {transfers.map((t) => (
              <SettlementRow
                key={`pending-${t.fromId}-${t.toId}-${t.amount}`}
                fromId={t.fromId}
                fromName={t.fromName}
                fromEmoji={t.fromEmoji}
                fromColor={t.fromColor}
                toId={t.toId}
                toName={t.toName}
                toEmoji={t.toEmoji}
                toColor={t.toColor}
                amount={t.amount}
                canEdit={canEdit}
              />
            ))}
          </div>
        </>
      )}

      {settledBatches.length > 0 && (
        <>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            Settled batches
          </div>
          <div className="flex flex-col gap-2">
            {settledBatches.map((batch) => (
              <SettledBatchRow
                key={batch.id}
                id={batch.id}
                fromName={batch.fromName}
                fromEmoji={batch.fromEmoji}
                fromColor={batch.fromColor}
                toName={batch.toName}
                toEmoji={batch.toEmoji}
                toColor={batch.toColor}
                amount={batch.amount}
                settledAt={batch.settledAt}
                canEdit={canEdit}
              />
            ))}
          </div>
        </>
      )}

      {allClear && (
        <div className="flex flex-col items-center justify-center gap-3 py-14 text-[13px] text-[var(--text-secondary)]">
          <CheckCircle2 className="h-10 w-10 text-[var(--text-success)]" />
          <span>Everyone is square. No transfers needed.</span>
        </div>
      )}

      {transfers.length === 0 && settledBatches.length > 0 && (
        <p className="mt-4 text-center text-[12px] text-[var(--text-secondary)]">
          All current balances are settled. Undo a batch above if payment was
          recorded by mistake.
        </p>
      )}
    </>
  );
}
