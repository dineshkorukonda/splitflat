"use server";

import {
  clearSessionCookie,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { getFlatPassword } from "@/lib/settings";
import { redirect } from "next/navigation";

export async function loginAction(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get("password")?.toString() ?? "";
  const redirectTo = formData.get("redirect")?.toString() || "/";

  const configured = await getFlatPassword();
  if (!configured) {
    return { error: "Flat password is not configured on the server" };
  }

  if (!(await verifyPassword(password))) {
    return { error: "Incorrect password" };
  }

  await setSessionCookie();
  redirect(redirectTo);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/settings");
}
