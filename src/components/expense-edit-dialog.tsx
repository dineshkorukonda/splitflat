"use client";

import { deleteExpense } from "@/actions/expenses";
import { AddExpenseForm } from "@/components/add-expense-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CategoryOption, ExpenseWithDetails, Member } from "@/lib/queries";
import { useState, useTransition } from "react";

type ExpenseEditDialogProps = {
  expense: ExpenseWithDetails | null;
  members: Member[];
  categories: CategoryOption[];
  onClose: () => void;
};

export function ExpenseEditDialog({
  expense,
  members,
  categories,
  onClose,
}: ExpenseEditDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (!expense) return;
    startTransition(async () => {
      await deleteExpense(expense.id);
      onClose();
    });
  };

  return (
    <Dialog open={!!expense} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit expense</DialogTitle>
        </DialogHeader>
        {expense && (
          <>
            <AddExpenseForm
              members={members}
              categories={categories}
              expense={expense}
              onClose={onClose}
              onSaved={onClose}
              embedded
            />
            <div className="mt-2 border-t border-[var(--border-tertiary)] pt-3">
              {!confirmDelete ? (
                <Button
                  variant="outline"
                  className="w-full text-[var(--text-danger)]"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete expense
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-[var(--text-secondary)]">
                    Deleting this expense will shift everyone&apos;s balances.
                    Continue?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-[var(--text-danger)] hover:opacity-90"
                      onClick={handleDelete}
                      disabled={isPending}
                    >
                      {isPending ? "Deleting…" : "Confirm delete"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
