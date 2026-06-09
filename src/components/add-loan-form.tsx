"use client";

import { createPersonalLoan } from "@/actions/personal-debts";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Member } from "@/lib/queries";
import { useState, useTransition } from "react";

type AddLoanFormProps = {
  members: Member[];
  onClose: () => void;
  onSaved?: () => void;
};

export function AddLoanForm({ members, onClose, onSaved }: AddLoanFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lenderId, setLenderId] = useState(members[0]?.id ?? "");
  const [borrowerId, setBorrowerId] = useState(members[1]?.id ?? members[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid amount");
      return;
    }

    startTransition(async () => {
      try {
        await createPersonalLoan({
          lenderId,
          borrowerId,
          amount: parsed,
          note: note.trim() || undefined,
        });
        onSaved?.();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save loan");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4"
    >
      <div className="mb-3 text-[13px] font-semibold text-[var(--text-primary)]">
        New personal loan
      </div>

      <div className="mb-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label>Lent by</Label>
          <Select value={lenderId} onValueChange={setLenderId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <span className="flex items-center gap-2">
                    <MemberAvatar
                      name={m.name}
                      emoji={m.emoji}
                      colorCode={m.colorCode}
                    />
                    {m.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Borrowed by</Label>
          <Select value={borrowerId} onValueChange={setBorrowerId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <span className="flex items-center gap-2">
                    <MemberAvatar
                      name={m.name}
                      emoji={m.emoji}
                      colorCode={m.colorCode}
                    />
                    {m.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-2.5 flex flex-col gap-1">
        <Label htmlFor="loan-amount">Amount (₹)</Label>
        <Input
          id="loan-amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="mb-3 flex flex-col gap-1">
        <Label htmlFor="loan-note">Note (optional)</Label>
        <Input
          id="loan-note"
          placeholder="e.g. Emergency cash, UPI transfer…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {error && (
        <p className="mb-2 text-xs text-[var(--text-danger)]">{error}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Record loan"}
        </Button>
      </div>
    </form>
  );
}
