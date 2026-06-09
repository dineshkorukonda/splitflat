"use client";

import { updateMemberEmoji } from "@/actions/members";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MemberBalance } from "@/lib/balance";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type MemberIconEditorProps = {
  member: MemberBalance;
  canEdit: boolean;
};

export function MemberIconEditor({ member, canEdit }: MemberIconEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [emoji, setEmoji] = useState(member.emoji);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        await updateMemberEmoji(member.memberId, emoji);
        setEditing(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  };

  return (
    <div className="relative">
      <MemberAvatar
        name={member.name}
        emoji={member.emoji}
        colorCode={member.colorCode}
        size="lg"
      />
      {canEdit && !editing && (
        <button
          type="button"
          onClick={() => {
            setEmoji(member.emoji);
            setEditing(true);
          }}
          className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border-tertiary)] bg-[var(--bg-primary)] text-[var(--text-secondary)] shadow-sm hover:text-[var(--text-primary)]"
          title="Change icon"
        >
          <Pencil className="h-2.5 w-2.5" />
        </button>
      )}
      {editing && (
        <div className="absolute left-0 top-full z-10 mt-2 w-44 rounded-[var(--radius-md)] border border-[var(--border-tertiary)] bg-[var(--bg-elevated)] p-3 shadow-lg">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            Change icon
          </p>
          <Input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="mb-2 text-center text-xl"
            maxLength={4}
          />
          {error && (
            <p className="mb-2 text-[10px] text-[var(--text-danger)]">{error}</p>
          )}
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleSave}
              disabled={isPending}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
