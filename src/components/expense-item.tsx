"use client";

import { SplitPill } from "@/components/split-pill";
import { getCategoryMeta, type CategoryMeta } from "@/lib/categories";
import { formatCurrencyPlain, formatExpenseDate } from "@/lib/format";
import type { ExpenseWithDetails } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

type ExpenseItemProps = {
  expense: ExpenseWithDetails;
  categoryMeta?: CategoryMeta;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ExpenseItem({
  expense,
  categoryMeta,
  canEdit,
  onEdit,
  onDelete,
}: ExpenseItemProps) {
  const category = categoryMeta ?? getCategoryMeta(expense.category);

  return (
    <div className="card card-interactive flex items-center gap-3 px-4 py-3">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]",
          category.iconClass
        )}
      >
        <DynamicIcon name={category.iconName} className="h-5 w-5" />
      </div>
      <button
        type="button"
        className={cn(
          "min-w-0 flex-1 text-left",
          onEdit && "cursor-pointer"
        )}
        onClick={onEdit}
      >
        <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">
          {expense.description}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
          <span>{formatExpenseDate(expense.date)}</span>
          <SplitPill members={expense.splits.map((s) => s.member)} />
        </div>
      </button>
      <div className="shrink-0 text-right">
        <div className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
          {formatCurrencyPlain(expense.amount)}
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--text-secondary)] flex items-center justify-end gap-1">
          <DynamicIcon name={expense.paidBy.iconName} className="h-3 w-3 text-[var(--text-secondary)]" />
          <span>{expense.paidBy.name}</span>
        </div>
      </div>
      {canEdit && (onEdit || onDelete) && (
        <div className="flex shrink-0 flex-col gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Edit expense"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-danger)] hover:bg-[var(--bg-secondary)] cursor-pointer"
              title="Delete expense"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
