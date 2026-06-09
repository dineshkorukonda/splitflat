"use client";

import { SplitPill } from "@/components/split-pill";
import { getCategoryMeta, type CategoryMeta } from "@/lib/categories";
import { formatCurrencyPlain, formatExpenseDate } from "@/lib/format";
import type { ExpenseWithDetails } from "@/lib/queries";
import { cn } from "@/lib/utils";

type ExpenseItemProps = {
  expense: ExpenseWithDetails;
  categoryMeta?: CategoryMeta;
  onClick?: () => void;
};

export function ExpenseItem({
  expense,
  categoryMeta,
  onClick,
}: ExpenseItemProps) {
  const category = categoryMeta ?? getCategoryMeta(expense.category);

  return (
    <div
      className={cn(
        "card card-interactive flex items-center gap-3 px-4 py-3",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-lg",
          category.iconClass
        )}
      >
        {category.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">
          {expense.description}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
          <span>{formatExpenseDate(expense.date)}</span>
          <SplitPill members={expense.splits.map((s) => s.member)} />
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
          {formatCurrencyPlain(expense.amount)}
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
          {expense.paidBy.emoji} {expense.paidBy.name}
        </div>
      </div>
    </div>
  );
}
