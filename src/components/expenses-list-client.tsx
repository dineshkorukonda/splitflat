"use client";

import { deleteExpense } from "@/actions/expenses";
import { ExpenseEditDialog } from "@/components/expense-edit-dialog";
import { ExpenseItem } from "@/components/expense-item";
import type { CategoryOption, ExpenseWithDetails, Member } from "@/lib/queries";
import { formatMonthYear } from "@/lib/format";
import { useMemo, useState, useTransition } from "react";

type ExpensesListClientProps = {
  expenses: ExpenseWithDetails[];
  members: Member[];
  categories: CategoryOption[];
  canEdit: boolean;
  groupByMonth?: boolean;
};

export function ExpensesListClient({
  expenses,
  members,
  categories,
  canEdit,
  groupByMonth = false,
}: ExpensesListClientProps) {
  const [selected, setSelected] = useState<ExpenseWithDetails | null>(null);
  const [isPending, startTransition] = useTransition();

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.slug, c])),
    [categories]
  );

  const grouped = useMemo(() => {
    if (!groupByMonth) return null;
    const map = new Map<string, ExpenseWithDetails[]>();
    for (const exp of expenses) {
      const key = exp.date.slice(0, 7) + "-01";
      const list = map.get(key) ?? [];
      list.push(exp);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [expenses, groupByMonth]);

  const handleDelete = (exp: ExpenseWithDetails) => {
    const ok = window.confirm(
      `Delete "${exp.description}" (₹${exp.amount})? Balances will update.`
    );
    if (!ok) return;
    startTransition(async () => {
      await deleteExpense(exp.id);
      if (selected?.id === exp.id) setSelected(null);
    });
  };

  const renderItem = (exp: ExpenseWithDetails) => (
    <ExpenseItem
      key={exp.id}
      expense={exp}
      categoryMeta={categoryMap[exp.category]}
      canEdit={canEdit}
      onEdit={canEdit ? () => setSelected(exp) : undefined}
      onDelete={canEdit ? () => handleDelete(exp) : undefined}
    />
  );

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-[13px] text-[var(--text-secondary)]">
          No expenses yet.
        </p>
        {!canEdit && (
          <p className="text-[12px] text-[var(--text-secondary)]">
            Sign in to add the first one.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {groupByMonth && grouped ? (
        grouped.map(([monthKey, monthExpenses]) => (
          <div key={monthKey} className="mb-5">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
              {formatMonthYear(monthKey)}
            </div>
            <div className="flex flex-col gap-2">
              {monthExpenses.map(renderItem)}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col gap-2">
          {expenses.map(renderItem)}
        </div>
      )}

      {canEdit && (
        <ExpenseEditDialog
          expense={selected}
          members={members}
          categories={categories}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
