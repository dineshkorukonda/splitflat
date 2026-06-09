import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const FLAT_PASSWORD_KEY = "flat_password";

export async function getSetting(key: string): Promise<string | null> {
  try {
    const rows = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, key))
      .limit(1);
    return rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedAt: new Date() },
    });
}

export async function getFlatPassword(): Promise<string | null> {
  const fromDb = await getSetting(FLAT_PASSWORD_KEY);
  if (fromDb) return fromDb;
  return process.env.FLAT_PASSWORD ?? null;
}

export async function setFlatPassword(password: string): Promise<void> {
  await setSetting(FLAT_PASSWORD_KEY, password);
}
