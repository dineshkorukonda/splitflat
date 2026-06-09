"use client";

import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Flat password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter shared password"
          required
          autoFocus
        />
      </div>
      {state.error && (
        <p className="text-xs text-[var(--text-danger)]">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in to edit"}
      </Button>
    </form>
  );
}
