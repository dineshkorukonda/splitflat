"use server";

import { db } from "@/db";
import { members } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateMemberIcon(memberId: string, iconName: string) {
  await requireAuth();

  const trimmed = iconName.trim();
  if (!trimmed) throw new Error("Pick an icon");

  await db
    .update(members)
    .set({ iconName: trimmed })
    .where(eq(members.id, memberId));

  revalidatePath("/members");
  revalidatePath("/");
  revalidatePath("/settle");
}

export async function verifyMemberPasscode(memberId: string, passcode: string): Promise<boolean> {
  const rows = await db
    .select({ passcode: members.passcode })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);
  return rows[0]?.passcode === passcode;
}

export async function updateMemberPasscode(memberId: string, oldPasscode: string, newPasscode: string) {
  await requireAuth();

  if (newPasscode.length < 4) {
    throw new Error("Passcode must be at least 4 characters");
  }

  const rows = await db
    .select({ passcode: members.passcode })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);

  if (rows[0]?.passcode !== oldPasscode) {
    throw new Error("Incorrect current passcode");
  }

  await db
    .update(members)
    .set({ passcode: newPasscode })
    .where(eq(members.id, memberId));

  revalidatePath("/members");
}
