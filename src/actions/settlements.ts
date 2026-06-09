"use server";

import { db } from "@/db";
import { settlements } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
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

export async function unsettleBatch(settlementId: string) {
  await requireAuth();

  const deleted = await db
    .delete(settlements)
    .where(eq(settlements.id, settlementId))
    .returning();

  if (deleted.length === 0) {
    throw new Error("Settlement not found");
  }

  revalidatePath("/");
  revalidatePath("/settle");
  revalidatePath("/members");
}
