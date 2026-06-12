import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { BUILTIN_CATEGORIES } from "@/lib/categories";
import { FLATMATES } from "@/lib/constants";
import {
  categories,
  expenseSplits,
  expenses,
  members,
  settlements,
} from "./schema";

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  const reset = process.env.SEED_RESET === "true";

  const existingMembers = await db.select().from(members);

  if (existingMembers.length > 0 && !reset) {
    console.log(
      "Members already exist. Set SEED_RESET=true to wipe data and reseed flatmates."
    );
    await seedCategories(db);
    return;
  }

  if (reset) {
    console.log("SEED_RESET=true — clearing expenses, settlements, members…");
    await db.delete(expenseSplits);
    await db.delete(expenses);
    await db.delete(settlements);
    await db.delete(members);
  }

  console.log("Seeding flatmates…");
  await db.insert(members).values(
    FLATMATES.map((m) => ({
      name: m.name,
      iconName: m.iconName,
      colorCode: m.colorCode,
      passcode: m.passcode,
    }))
  );

  await seedCategories(db);
  console.log("Done.");
}

async function seedCategories(db: ReturnType<typeof drizzle>) {
  const existing = await db.select().from(categories);
  if (existing.length > 0) return;

  console.log("Seeding categories…");
  await db.insert(categories).values(
    BUILTIN_CATEGORIES.map((c) => ({
      slug: c.slug,
      label: c.label,
      iconName: c.iconName,
    }))
  );
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
