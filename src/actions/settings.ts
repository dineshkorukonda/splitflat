"use server";

import { db } from "@/db";
import {
  expenses,
  personalDebtPayments,
  personalDebts,
  settlements,
} from "@/db/schema";
import { requireAuth, verifyPassword } from "@/lib/auth";
import { setFlatPassword } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export async function changeFlatPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ error?: string; success?: string }> {
  await requireAuth();

  if (newPassword.length < 4) {
    return { error: "New password must be at least 4 characters" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" };
  }
  if (!(await verifyPassword(currentPassword))) {
    return { error: "Current password is incorrect" };
  }

  await setFlatPassword(newPassword);
  revalidatePath("/settings");

  return { success: "Flat password updated" };
}

export async function resetAllData(
  password: string
): Promise<{ error?: string; success?: string }> {
  await requireAuth();

  if (!(await verifyPassword(password))) {
    return { error: "Incorrect password" };
  }

  await db.delete(personalDebtPayments);
  await db.delete(personalDebts);
  await db.delete(settlements);
  await db.delete(expenses);

  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/settle");
  revalidatePath("/loans");
  revalidatePath("/members");
  revalidatePath("/settings");

  return {
    success: "All expenses, settlements, and personal loans cleared",
  };
}
