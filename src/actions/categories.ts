"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { slugifyCategory } from "@/lib/categories";
import { revalidatePath } from "next/cache";

export async function addCategory(label: string, emoji: string) {
  await requireAuth();
  if (!label.trim()) throw new Error("Category name is required");
  if (!emoji.trim()) throw new Error("Pick an emoji icon");

  let slug = slugifyCategory(label);
  const existing = await db.select().from(categories);
  if (existing.some((c) => c.slug === slug)) {
    slug = `${slug}-${Date.now()}`;
  }

  await db.insert(categories).values({
    slug,
    label: label.trim(),
    emoji: emoji.trim(),
  });

  revalidatePath("/");
  revalidatePath("/expenses");

  return slug;
}
