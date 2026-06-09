"use server";

import { db } from "@/db";
import { expenseSplits, expenses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { roundMoney } from "@/lib/format";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ExpenseInput = {
  description: string;
  amount: number;
  paidById: string;
  category: string;
  date: string;
  memberIds: string[];
};

function validateExpenseInput(data: ExpenseInput) {
  if (!data.description.trim()) throw new Error("Description is required");
  if (data.amount <= 0) throw new Error("Amount must be greater than 0");
  if (data.memberIds.length === 0)
    throw new Error("Select at least one member to split with");
}

function computeShares(amount: number, memberIds: string[]) {
  const shareEach = Math.floor((amount * 100) / memberIds.length) / 100;
  const remainder = roundMoney(amount - shareEach * memberIds.length);
  return memberIds.map((_, idx) =>
    roundMoney(idx === 0 ? shareEach + remainder : shareEach)
  );
}

function revalidateExpensePaths() {
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/settle");
  revalidatePath("/members");
}

export async function addExpense(data: ExpenseInput) {
  await requireAuth();
  validateExpenseInput(data);

  const shares = computeShares(data.amount, data.memberIds);

  await db.transaction(async (tx) => {
    const [expense] = await tx
      .insert(expenses)
      .values({
        description: data.description.trim(),
        amount: data.amount.toFixed(2),
        paidBy: data.paidById,
        category: data.category,
        date: data.date,
      })
      .returning();

    await tx.insert(expenseSplits).values(
      data.memberIds.map((memberId, i) => ({
        expenseId: expense.id,
        memberId,
        share: shares[i].toFixed(2),
      }))
    );
  });

  revalidateExpensePaths();
}

export async function updateExpense(id: string, data: ExpenseInput) {
  await requireAuth();
  validateExpenseInput(data);

  const shares = computeShares(data.amount, data.memberIds);

  await db.transaction(async (tx) => {
    await tx
      .update(expenses)
      .set({
        description: data.description.trim(),
        amount: data.amount.toFixed(2),
        paidBy: data.paidById,
        category: data.category,
        date: data.date,
      })
      .where(eq(expenses.id, id));

    await tx.delete(expenseSplits).where(eq(expenseSplits.expenseId, id));

    await tx.insert(expenseSplits).values(
      data.memberIds.map((memberId, i) => ({
        expenseId: id,
        memberId,
        share: shares[i].toFixed(2),
      }))
    );
  });

  revalidateExpensePaths();
}

export async function deleteExpense(id: string) {
  await requireAuth();
  await db.delete(expenses).where(eq(expenses.id, id));
  revalidateExpensePaths();
}
