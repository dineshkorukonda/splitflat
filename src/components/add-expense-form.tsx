"use client";

import { addExpense, updateExpense } from "@/actions/expenses";
import { CategorySelect } from "@/components/category-select";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryOption, ExpenseWithDetails, Member } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState, useTransition } from "react";

type AddExpenseFormProps = {
  members: Member[];
  categories: CategoryOption[];
  expense?: ExpenseWithDetails;
  onClose: () => void;
  onSaved?: () => void;
  embedded?: boolean;
};

export function AddExpenseForm({
  members,
  categories,
  expense,
  onClose,
  onSaved,
  embedded = false,
}: AddExpenseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? "");
  const [paidById, setPaidById] = useState(
    expense?.paidBy.id ?? members[0]?.id ?? ""
  );
  const [category, setCategory] = useState(
    expense?.category ?? categories[0]?.slug ?? "food"
  );
  const [date, setDate] = useState(
    expense?.date ?? format(new Date(), "yyyy-MM-dd")
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(expense?.splits.map((s) => s.member.id) ?? members.map((m) => m.id))
  );

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    const data = {
      description,
      amount: parsedAmount,
      paidById,
      category,
      date,
      memberIds: Array.from(selectedIds),
    };

    startTransition(async () => {
      try {
        if (expense) {
          await updateExpense(expense.id, data);
        } else {
          await addExpense(data);
        }
        onSaved?.();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={
        embedded
          ? "space-y-2.5"
          : "mb-4 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4"
      }
    >
      <div className="mb-2.5 flex flex-col gap-1">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="e.g. Groceries, Electricity bill…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="mb-2.5 grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Paid by</Label>
          <Select value={paidById} onValueChange={setPaidById}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.emoji} {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-2.5 flex flex-col gap-1">
        <Label>Category</Label>
        <CategorySelect
          categories={categories}
          value={category}
          onChange={setCategory}
        />
      </div>

      <div className="mb-2.5 flex flex-col gap-1">
        <Label>Date</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="mb-3 flex flex-col gap-1">
        <Label>Split between</Label>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const checked = selectedIds.has(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMember(m.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition-colors",
                  checked
                    ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]"
                    : "border-[var(--border-secondary)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                )}
              >
                <MemberAvatar
                  name={m.name}
                  emoji={m.emoji}
                  colorCode={m.colorCode}
                />
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="mb-2 text-xs text-[var(--text-danger)]">{error}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : expense ? "Update expense" : "Save expense"}
        </Button>
      </div>
    </form>
  );
}
