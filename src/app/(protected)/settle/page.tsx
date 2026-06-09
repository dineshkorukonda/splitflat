import { SettlementRow } from "@/components/settlement-row";
import { getMinimizedTransfers } from "@/lib/queries";
import { CheckCircle2 } from "lucide-react";

export default async function SettlePage() {
  const transfers = await getMinimizedTransfers();

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
                ? "All settled up"
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

      {transfers.length > 0 ? (
        <>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            Who pays whom
          </div>
          <div className="flex flex-col gap-2">
            {transfers.map((t) => (
              <SettlementRow
                key={`${t.fromId}-${t.toId}-${t.amount}`}
                fromId={t.fromId}
                fromName={t.fromName}
                fromEmoji={t.fromEmoji}
                fromColor={t.fromColor}
                toId={t.toId}
                toName={t.toName}
                toEmoji={t.toEmoji}
                toColor={t.toColor}
                amount={t.amount}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <CheckCircle2 className="h-10 w-10 text-[var(--text-success)]" />
          <p className="text-[14px] font-medium text-[var(--text-primary)]">
            All settled up
          </p>
          <p className="text-[13px] text-[var(--text-secondary)]">
            No outstanding balances.
          </p>
        </div>
      )}
    </>
  );
}
