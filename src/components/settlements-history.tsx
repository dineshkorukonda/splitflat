"use client";

import { deleteSettlement } from "@/actions/settlements";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { formatCurrencyPlain } from "@/lib/format";
import type { SettlementWithDetails } from "@/lib/queries";
import { format } from "date-fns";
import { ArrowRight, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function SettlementsHistory({
  settlements,
}: {
  settlements: SettlementWithDetails[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this settlement? This will restore the balance.")) return;
    startTransition(async () => {
      try {
        await deleteSettlement(id);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  };

  if (settlements.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
        Settlement History
      </div>
      <div className="flex flex-col gap-2">
        {settlements.map((s) => (
          <div
            key={s.id}
            className="card flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 text-[13px]">
                <MemberAvatar
                  name={s.fromName}
                  iconName={s.fromIcon}
                  colorCode={s.fromColor}
                  size="sm"
                />
                <span className="font-medium">{s.fromName}</span>
                <span className="text-[var(--text-secondary)] text-[12px]">paid</span>
                <ArrowRight className="h-3 w-3 text-[var(--text-secondary)]" />
                <MemberAvatar
                  name={s.toName}
                  iconName={s.toIcon}
                  colorCode={s.toColor}
                  size="sm"
                />
                <span className="font-medium">{s.toName}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                <span>{format(new Date(s.settledAt), "MMM d, yyyy h:mm a")}</span>
                {s.note && <span className="italic"> · &ldquo;{s.note}&rdquo;</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                {formatCurrencyPlain(s.amount)}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 border-transparent hover:border-[var(--border-secondary)] text-[var(--text-danger)] hover:bg-[var(--text-danger)]/5 cursor-pointer"
                onClick={() => handleDelete(s.id)}
                disabled={isPending}
                title="Delete settlement"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
