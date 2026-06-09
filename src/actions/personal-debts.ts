"use server";

import { db } from "@/db";
import { personalDebtPayments, personalDebts } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { getPersonalDebtRemaining } from "@/lib/personal-debt";
import { roundMoney } from "@/lib/format";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function revalidateLoanPaths() {
  revalidatePath("/loans");
  revalidatePath("/members");
}

export async function createPersonalLoan(data: {
  lenderId: string;
  borrowerId: string;
  amount: number;
  note?: string;
}) {
  await requireAuth();

  if (data.lenderId === data.borrowerId) {
    throw new Error("Lender and borrower must be different people");
  }
  if (data.amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  await db.insert(personalDebts).values({
    lenderId: data.lenderId,
    borrowerId: data.borrowerId,
    amount: data.amount.toFixed(2),
    note: data.note?.trim() || null,
  });

  revalidateLoanPaths();
}

export async function repayPersonalLoan(debtId: string, amount: number) {
  await requireAuth();

  if (amount <= 0) {
    throw new Error("Repayment must be greater than 0");
  }

  const remaining = await getPersonalDebtRemaining(debtId);
  if (remaining <= 0.01) {
    throw new Error("This loan is already fully repaid");
  }
  if (amount > remaining + 0.01) {
    throw new Error(
      `Repayment cannot exceed remaining balance (₹${remaining.toLocaleString("en-IN")})`
    );
  }

  const payAmount = roundMoney(Math.min(amount, remaining));

  await db.insert(personalDebtPayments).values({
    debtId,
    amount: payAmount.toFixed(2),
  });

  revalidateLoanPaths();
}

export async function deletePersonalLoan(debtId: string) {
  await requireAuth();
  await db.delete(personalDebts).where(eq(personalDebts.id, debtId));
  revalidateLoanPaths();
}
