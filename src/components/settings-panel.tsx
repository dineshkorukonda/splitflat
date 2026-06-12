"use client";

import { changeFlatPassword, resetAllData } from "@/actions/settings";
import { logoutAction } from "@/actions/auth";
import { useTheme, type ThemePreference } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useState, useTransition } from "react";
import { useViewAs } from "@/components/view-as-context";
import { updateMemberIcon, updateMemberPasscode } from "@/actions/members";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import type { Member } from "@/lib/queries";
import { useRouter } from "next/navigation";

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
  members: Member[];
};

export function SettingsPanel({ canEdit, members }: SettingsPanelProps) {
  const { preference, setPreference, ready } = useTheme();
  const { memberId } = useViewAs();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeMember = members.find((m) => m.id === memberId);

  // Flat password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  // User passcode form state
  const [userCurrentPasscode, setUserCurrentPasscode] = useState("");
  const [userNewPasscode, setUserNewPasscode] = useState("");
  const [userConfirmPasscode, setUserConfirmPasscode] = useState("");
  const [userPasscodeMsg, setUserPasscodeMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  // Reset data form state
  const [showReset, setShowReset] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [userPasscodes, setUserPasscodes] = useState<Record<string, string>>({});
  const [resetMsg, setResetMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const AVAILABLE_ICONS = [
    "User",
    "Coffee",
    "Gamepad2",
    "Music",
    "Laptop",
    "Bike",
    "Sparkles",
    "Camera",
    "BookOpen",
    "Heart",
    "Smile",
    "Star",
  ];

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

  const handleIconSelect = (iconName: string) => {
    startTransition(async () => {
      try {
        await updateMemberIcon(memberId, iconName);
        router.refresh();
      } catch (err) {
        console.error("Failed to update icon", err);
      }
    });
  };

  const handleUserPasscodeChange = (e: React.FormEvent) => {
    e.preventDefault();
    setUserPasscodeMsg(null);
    if (userNewPasscode !== userConfirmPasscode) {
      setUserPasscodeMsg({ type: "error", text: "New passcodes do not match" });
      return;
    }
    startTransition(async () => {
      try {
        await updateMemberPasscode(memberId, userCurrentPasscode, userNewPasscode);
        setUserPasscodeMsg({ type: "success", text: "Passcode updated successfully" });
        setUserCurrentPasscode("");
        setUserNewPasscode("");
        setUserConfirmPasscode("");
        router.refresh();
      } catch (err) {
        setUserPasscodeMsg({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to update passcode",
        });
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
                  "flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] border px-3 py-3 text-[12px] transition-colors cursor-pointer",
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

      {/* Roommate Settings */}
      {activeMember && (
        <section className="card p-4">
          <h2 className="mb-1 text-[13px] font-semibold text-[var(--text-primary)]">
            Roommate Settings ({activeMember.name})
          </h2>
          <p className="mb-4 text-[12px] text-[var(--text-secondary)]">
            Change your personal avatar icon and passcode.
          </p>

          <div className="space-y-4">
            {/* Icon Picker */}
            <div>
              <Label className="block mb-2">Your icon</Label>
              <div className="grid grid-cols-6 gap-2">
                {AVAILABLE_ICONS.map((icon) => {
                  const active = activeMember.iconName === icon;
                  return (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => handleIconSelect(icon)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-md border p-1 transition-colors cursor-pointer mx-auto",
                        active
                          ? "border-[var(--text-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                          : "border-[var(--border-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/50 hover:text-[var(--text-primary)]"
                      )}
                      disabled={isPending}
                    >
                      <DynamicIcon name={icon} className="h-4.5 w-4.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Passcode Form */}
            <form onSubmit={handleUserPasscodeChange} className="space-y-3 pt-4 border-t border-[var(--border-tertiary)]/50">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Change your passcode
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="user-current-passcode">Current passcode</Label>
                <Input
                  id="user-current-passcode"
                  type="password"
                  value={userCurrentPasscode}
                  onChange={(e) => setUserCurrentPasscode(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="user-new-passcode">New passcode</Label>
                <Input
                  id="user-new-passcode"
                  type="password"
                  value={userNewPasscode}
                  onChange={(e) => setUserNewPasscode(e.target.value)}
                  required
                  minLength={4}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="user-confirm-passcode">Confirm new passcode</Label>
                <Input
                  id="user-confirm-passcode"
                  type="password"
                  value={userConfirmPasscode}
                  onChange={(e) => setUserConfirmPasscode(e.target.value)}
                  required
                  minLength={4}
                />
              </div>
              {userPasscodeMsg && (
                <p
                  className={cn(
                    "text-xs",
                    userPasscodeMsg.type === "error"
                      ? "text-[var(--text-danger)]"
                      : "text-[var(--text-success)]"
                  )}
                >
                  {userPasscodeMsg.text}
                </p>
              )}
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Updating…" : "Update passcode"}
              </Button>
            </form>
          </div>
        </section>
      )}



      {/* Flat Password */}
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
              <Label htmlFor="current-password">Current flat password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="new-password">New flat password</Label>
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
              <Label htmlFor="confirm-password">Confirm new flat password</Label>
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
              {isPending ? "Updating…" : "Update flat password"}
            </Button>
          </form>
        ) : null}
      </section>

      {/* Reset data */}
      <section className="card border-[var(--text-danger)]/30 p-4">
        <h2 className="mb-1 text-[13px] font-semibold text-[var(--text-danger)]">
          Reset all data
        </h2>
        <p className="mb-3 text-[12px] text-[var(--text-secondary)]">
          Deletes every expense, settlement, and personal loan. Members and
          categories stay.
        </p>
        {canEdit ? (
          <>
            {!showReset ? (
              <Button
                variant="outline"
                size="sm"
                className="text-[var(--text-danger)]"
                onClick={() => setShowReset(true)}
              >
                Reset all data
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="reset-password">Confirm with flat password</Label>
                  <Input
                    id="reset-password"
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Enter flat password"
                  />
                </div>

                <div className="border border-[var(--border-tertiary)]/60 rounded-[var(--radius-md)] p-3 bg-[var(--bg-tertiary)]/50 space-y-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Roommate Authorizations (All passcodes required)
                  </div>
                  {members.map((m) => (
                    <div key={m.id} className="flex flex-col gap-1">
                      <Label htmlFor={`passcode-${m.id}`}>{m.name}&apos;s passcode</Label>
                      <Input
                        id={`passcode-${m.id}`}
                        type="password"
                        placeholder={`Enter ${m.name}'s passcode`}
                        value={userPasscodes[m.id] ?? ""}
                        onChange={(e) =>
                          setUserPasscodes((prev) => ({
                            ...prev,
                            [m.id]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>

                {resetMsg && (
                  <p
                    className={cn(
                      "text-xs",
                      resetMsg.type === "error"
                        ? "text-[var(--text-danger)]"
                        : "text-[var(--text-success)]"
                    )}
                  >
                    {resetMsg.text}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowReset(false);
                      setResetPassword("");
                      setUserPasscodes({});
                      setResetMsg(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[var(--text-danger)] hover:opacity-90"
                    disabled={isPending || !resetPassword}
                    onClick={() => {
                      setResetMsg(null);
                      startTransition(async () => {
                        const result = await resetAllData(resetPassword, userPasscodes);
                        if (result.error) {
                          setResetMsg({ type: "error", text: result.error });
                        } else {
                          setResetMsg({
                            type: "success",
                            text: result.success ?? "Data cleared",
                          });
                          setResetPassword("");
                          setUserPasscodes({});
                          setShowReset(false);
                        }
                      });
                    }}
                  >
                    {isPending ? "Resetting…" : "Confirm reset"}
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : null}
      </section>

      {/* Account */}
      <section className="card p-4">
        <h2 className="mb-1 text-[13px] font-semibold text-[var(--text-primary)]">
          Account
        </h2>
        <p className="mb-3 text-[12px] text-[var(--text-secondary)]">
          Signed in — you can add and edit expenses.
        </p>
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
      </section>
    </div>
  );
}
