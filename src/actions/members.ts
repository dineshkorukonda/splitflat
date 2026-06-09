"use server";

import { db } from "@/db";
import { members } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateMemberEmoji(memberId: string, emoji: string) {
  await requireAuth();

  const trimmed = emoji.trim();
  if (!trimmed) throw new Error("Pick an emoji");

  await db
    .update(members)
    .set({ emoji: trimmed })
    .where(eq(members.id, memberId));

  revalidatePath("/members");
  revalidatePath("/");
  revalidatePath("/settle");
}
