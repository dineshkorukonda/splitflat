"use client";

import { changeFlatPassword } from "@/actions/settings";
import { logoutAction } from "@/actions/auth";
import { useTheme, type ThemePreference } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LogIn, LogOut, Monitor, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

type SettingsPanelProps = {
  canEdit: boolean;
};

export function SettingsPanel({ canEdit }: SettingsPanelProps) {
  const { preference, setPreference, ready } = useTheme();
  const [isPending, startTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    startTransition(async () => {
      const result = await changeFlatPassword(
        currentPassword,
        newPassword,
        confirmPassword
      );
      if (result.error) {
        setPasswordMsg({ type: "error", text: result.error });
      } else {
        setPasswordMsg({
          type: "success",
          text: result.success ?? "Password updated",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Appearance */}
      <section className="card p-4">
        <h2 className="mb-1 text-[13px] font-semibold text-[var(--text-primary)]">
          Appearance
        </h2>
        <p className="mb-3 text-[12px] text-[var(--text-secondary)]">
          Choose how Kallurian&apos;s home looks on your device.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = ready && preference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPreference(opt.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] border px-3 py-3 text-[12px] transition-colors",
                  active
                    ? "border-[var(--text-primary)] bg-[var(--bg-secondary)] font-medium text-[var(--text-primary)]"
                    : "border-[var(--border-tertiary)] text-[var(--text-secondary)] hover:border-[var(--border-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="h-4 w-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Password */}
      <section className="card p-4">
        <h2 className="mb-1 text-[13px] font-semibold text-[var(--text-primary)]">
          Flat password
        </h2>
        <p className="mb-3 text-[12px] text-[var(--text-secondary)]">
          Shared password flatmates use to sign in and make changes.
        </p>
        {canEdit ? (
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={4}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={4}
              />
            </div>
            {passwordMsg && (
              <p
                className={cn(
                  "text-xs",
                  passwordMsg.type === "error"
                    ? "text-[var(--text-danger)]"
                    : "text-[var(--text-success)]"
                )}
              >
                {passwordMsg.text}
              </p>
            )}
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Updating…" : "Update password"}
            </Button>
          </form>
        ) : (
          <p className="text-[12px] text-[var(--text-secondary)]">
            Sign in to change the flat password.
          </p>
        )}
      </section>

      {/* Account */}
      <section className="card p-4">
        <h2 className="mb-1 text-[13px] font-semibold text-[var(--text-primary)]">
          Account
        </h2>
        <p className="mb-3 text-[12px] text-[var(--text-secondary)]">
          {canEdit
            ? "You are signed in and can add or edit expenses."
            : "You are viewing in read-only mode."}
        </p>
        {canEdit ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={isPending}
            onClick={() => startTransition(() => logoutAction())}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        ) : (
          <Button variant="default" size="sm" className="gap-1.5" asChild>
            <Link href="/login?from=/settings">
              <LogIn className="h-3.5 w-3.5" />
              Sign in
            </Link>
          </Button>
        )}
      </section>
    </div>
  );
}
