"use server";

import { db } from "@/db";
import { settlements } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import {
  computeBalances,
  getMemberNameMap,
  minimizeTransfers,
} from "@/lib/balance";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markSettled(
  fromId: string,
  toId: string,
  amount: number,
  note?: string
) {
  await requireAuth();
  if (amount <= 0) throw new Error("Amount must be positive");
  if (fromId === toId) throw new Error("Cannot settle with yourself");

  const balances = await computeBalances();
  const memberMap = await getMemberNameMap();
  const currentTransfers = minimizeTransfers(balances, memberMap);

  const isValid = currentTransfers.some(
    (t) =>
      t.fromId === fromId &&
      t.toId === toId &&
      Math.abs(t.amount - amount) < 0.01
  );

  if (!isValid) {
    throw new Error(
      "This settlement is no longer valid. The balance may have already been settled or changed."
    );
  }

  await db.insert(settlements).values({
    fromId,
    toId,
    amount: amount.toFixed(2),
    note: note ?? null,
  });

  revalidatePath("/");
  revalidatePath("/settle");
  revalidatePath("/members");
}

export async function deleteSettlement(id: string) {
  await requireAuth();
  await db.delete(settlements).where(eq(settlements.id, id));
  revalidatePath("/");
  revalidatePath("/settle");
  revalidatePath("/members");
}
