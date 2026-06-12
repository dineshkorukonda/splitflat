import { MemberIconEditor } from "@/components/member-icon-editor";
import { formatCurrency } from "@/lib/format";
import type { MemberBalance } from "@/lib/balance";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

type MemberRowProps = {
  member: MemberBalance;
  canEdit: boolean;
};

export function MemberRow({ member, canEdit }: MemberRowProps) {
  const balancePart =
    member.balance > 0.01
      ? `Owed ₹${member.balance.toLocaleString("en-IN")}`
      : member.balance < -0.01
        ? `Owes ₹${Math.abs(member.balance).toLocaleString("en-IN")}`
        : "Settled";

  return (
    <div className="card card-interactive flex items-center gap-3 px-4 py-3.5">
      <MemberIconEditor member={member} canEdit={canEdit} />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-[var(--text-primary)] flex items-center gap-1.5">
          <DynamicIcon name={member.iconName} className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
          <span>{member.name}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
          Paid ₹{member.totalPaid.toLocaleString("en-IN")} · {balancePart}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div
          className={cn(
            "text-sm font-semibold tabular-nums",
            member.balance > 0.01
              ? "text-[var(--text-success)]"
              : member.balance < -0.01
                ? "text-[var(--text-danger)]"
                : "text-[var(--text-secondary)]"
          )}
        >
          {formatCurrency(member.balance)}
        </div>
      </div>
    </div>
  );
}
