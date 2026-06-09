import { DashboardClient } from "@/components/dashboard-client";
import { ExpensesListClient } from "@/components/expenses-list-client";
import { isAuthenticated } from "@/lib/auth";
import {
  getCategories,
  getExpenses,
  getMemberBalances,
  getMemberShareForMonth,
  getMembers,
  getMonthlyTotal,
} from "@/lib/queries";
import { format } from "date-fns";
import Link from "next/link";

export default async function DashboardPage() {
  const now = new Date();
  const monthStart = format(now, "yyyy-MM-01");
  const monthEnd = format(now, "yyyy-MM-dd");
  const monthLabel = format(now, "MMMM yyyy");

  const [members, categories, recentExpenses, totalThisMonth, balances, canEdit] =
    await Promise.all([
      getMembers(),
      getCategories(),
      getExpenses({ limit: 10 }),
      getMonthlyTotal(monthStart, monthEnd),
      getMemberBalances(),
      isAuthenticated(),
    ]);

  const shares = await Promise.all(
    members.map(async (m) => ({
      id: m.id,
      share: await getMemberShareForMonth(m.id, monthStart, monthEnd),
    }))
  );

  const sharesByMember = Object.fromEntries(
    shares.map((s) => [s.id, s.share])
  );
  const balancesByMember = Object.fromEntries(
    balances.map((b) => [b.memberId, b.balance])
  );

  return (
    <>
      <DashboardClient
        totalThisMonth={totalThisMonth}
        monthLabel={monthLabel}
        sharesByMember={sharesByMember}
        balancesByMember={balancesByMember}
      />

      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
          Recent
        </div>
        <Link
          href="/expenses"
          className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          View all →
        </Link>
      </div>

      <ExpensesListClient
        expenses={recentExpenses}
        members={members}
        categories={categories}
        canEdit={canEdit}
      />
    </>
  );
}
