"use server";

import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  clearSessionCookie,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { getFlatPassword } from "@/lib/settings";
import { redirect } from "next/navigation";

export async function loginAction(
  flatPassword: string,
  memberId: string,
  passcode: string
): Promise<{ error?: string; success?: boolean }> {
  const configured = await getFlatPassword();
  if (!configured) {
    return { error: "Flat password is not configured on the server" };
  }

  if (!(await verifyPassword(flatPassword))) {
    return { error: "Incorrect flat password" };
  }

  // Verify roommate passcode
  const memberRows = await db
    .select({ passcode: members.passcode })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);

  if (memberRows.length === 0 || memberRows[0].passcode !== passcode) {
    return { error: "Incorrect passcode" };
  }

  try {
    await setSessionCookie();
    return { success: true };
  } catch {
    return {
      error:
        "Sign-in is not configured on the server. Set APP_SECRET (32+ chars) in environment variables.",
    };
  }
}

export async function checkFlatPassword(password: string): Promise<{ success: boolean; error?: string }> {
  const configured = await getFlatPassword();
  if (!configured) {
    return { success: false, error: "Flat password is not configured" };
  }
  const isCorrect = await verifyPassword(password);
  return { success: isCorrect };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
