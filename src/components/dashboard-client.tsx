"use client";

import { SummaryCards } from "@/components/summary-cards";
import { useViewAs } from "@/components/view-as-context";
type DashboardClientProps = {
  totalThisMonth: number;
  monthLabel: string;
  sharesByMember: Record<string, number>;
  balancesByMember: Record<string, number>;
};

export function DashboardClient({
  totalThisMonth,
  monthLabel,
  sharesByMember,
  balancesByMember,
}: DashboardClientProps) {
  const { memberId } = useViewAs();
  const yourShare = sharesByMember[memberId] ?? 0;
  const netBalance = balancesByMember[memberId] ?? 0;

  const balanceLabel =
    netBalance > 0.01
      ? "You are owed"
      : netBalance < -0.01
        ? "You owe"
        : "Net balance";

  return (
    <SummaryCards
      totalThisMonth={totalThisMonth}
      monthLabel={monthLabel}
      yourShare={yourShare}
      netBalance={netBalance}
      balanceLabel={balanceLabel}
    />
  );
}
