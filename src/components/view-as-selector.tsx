"use client";

import { verifyMemberPasscode } from "@/actions/members";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useViewAs } from "@/components/view-as-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import type { Member } from "@/lib/queries";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

type ViewAsSelectorProps = {
  members: Member[];
};

export function ViewAsSelector({ members }: ViewAsSelectorProps) {
  const { memberId, setMemberId, isReady } = useViewAs();
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected = members.find((m) => m.id === memberId) ?? members[0];
  const pendingMember = members.find((m) => m.id === pendingMemberId);

  const handleSelectChange = (id: string) => {
    if (id === memberId) return;
    setPendingMemberId(id);
    setPasscode("");
    setError(null);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingMemberId) return;

    setError(null);
    startTransition(async () => {
      try {
        const isValid = await verifyMemberPasscode(pendingMemberId, passcode);
        if (isValid) {
          setMemberId(pendingMemberId);
          setPendingMemberId(null);
          setPasscode("");
        } else {
          setError("Incorrect passcode");
        }
      } catch (err) {
        setError("Failed to verify passcode");
      }
    });
  };

  if (!isReady) {
    return (
      <span className="flex items-center gap-1 text-[12px] text-[var(--text-secondary)]">
        {selected && <DynamicIcon name={selected.iconName} className="h-3.5 w-3.5" />}
        View as {selected?.name ?? "…"}
      </span>
    );
  }

  return (
    <>
      <Select value={memberId} onValueChange={handleSelectChange}>
        <SelectTrigger className="h-8 w-auto min-w-[140px] border-0 bg-transparent text-[12px] text-[var(--text-secondary)] shadow-none">
          <SelectValue placeholder="View as" />
        </SelectTrigger>
        <SelectContent>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              <span className="flex items-center gap-1.5">
                <DynamicIcon name={m.iconName} className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                View as {m.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={pendingMemberId !== null} onOpenChange={(open) => { if (!open) setPendingMemberId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>View as {pendingMember?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-[13px] text-[var(--text-secondary)]">
              Enter the passcode for {pendingMember?.name} to switch views.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-as-passcode">Passcode</Label>
              <Input
                id="view-as-passcode"
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••"
                required
                autoFocus
              />
            </div>
            {error && (
              <p className="text-[12px] text-[var(--text-danger)]">{error}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPendingMemberId(null)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  "Switch view"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
