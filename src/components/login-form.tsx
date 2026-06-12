"use client";

import { checkFlatPassword, loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberAvatar } from "@/components/member-avatar";
import type { Member } from "@/lib/queries";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({
  redirectTo,
  members,
}: {
  redirectTo: string;
  members: Member[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [flatPassword, setFlatPassword] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleVerifyFlatPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await checkFlatPassword(flatPassword);
      if (res.success) {
        setStep(2);
      } else {
        setError(res.error ?? "Incorrect flat password");
      }
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setError("Please select a flatmate");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await loginAction(flatPassword, selectedMemberId, passcode);
      if (res.success) {
        localStorage.setItem("flat_view_as", selectedMemberId);
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(res.error ?? "Failed to log in");
      }
    });
  };

  if (step === 1) {
    return (
      <form onSubmit={handleVerifyFlatPassword} className="space-y-4">
        <div className="flex flex-col gap-1.5 text-left">
          <Label htmlFor="flat-password">Flat password</Label>
          <Input
            id="flat-password"
            type="password"
            value={flatPassword}
            onChange={(e) => setFlatPassword(e.target.value)}
            placeholder="Enter flat password"
            required
            autoFocus
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--text-danger)] text-left">{error}</p>
        )}
        <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
          {isPending ? "Checking…" : "Next"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      {selectedMemberId === null ? (
        <div className="space-y-4">
          <div className="text-center mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Who is signing in?
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedMemberId(m.id);
                  setError(null);
                }}
                className="card card-interactive flex flex-col items-center gap-2.5 p-4 border border-[var(--border-tertiary)] hover:border-[var(--text-primary)] transition-all cursor-pointer rounded-xl bg-[var(--background-soft)]/20"
              >
                <MemberAvatar name={m.name} iconName={m.iconName} colorCode={m.colorCode} size="lg" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">{m.name}</span>
              </button>
            ))}
          </div>
          {error && (
            <p className="text-xs text-[var(--text-danger)] text-center">{error}</p>
          )}
          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            onClick={() => {
              setStep(1);
              setFlatPassword("");
              setError(null);
            }}
          >
            Back to Flat Password
          </Button>
        </div>
      ) : selectedMember ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <MemberAvatar name={selectedMember.name} iconName={selectedMember.iconName} colorCode={selectedMember.colorCode} size="lg" />
            <span className="text-base font-bold text-[var(--text-primary)]">{selectedMember.name}</span>
          </div>

          <div className="w-full flex flex-col gap-1.5 text-left">
            <Label htmlFor="passcode" className="text-center">Enter your passcode</Label>
            <Input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••"
              required
              autoFocus
              maxLength={6}
              className="text-center text-lg tracking-widest font-mono"
            />
          </div>

          {error && (
            <p className="text-xs text-[var(--text-danger)] text-center">{error}</p>
          )}

          <div className="w-full flex flex-col gap-2">
            <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              onClick={() => {
                setSelectedMemberId(null);
                setPasscode("");
                setError(null);
              }}
            >
              Choose a different flatmate
            </Button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
