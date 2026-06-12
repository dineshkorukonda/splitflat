"use client";

import { updateMemberIcon } from "@/actions/members";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import type { MemberBalance } from "@/lib/balance";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

type MemberIconEditorProps = {
  member: MemberBalance;
  canEdit: boolean;
};

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

export function MemberIconEditor({ member, canEdit }: MemberIconEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(member.iconName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        await updateMemberIcon(member.memberId, selectedIcon);
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
        iconName={member.iconName}
        colorCode={member.colorCode}
        size="lg"
      />
      {canEdit && !editing && (
        <button
          type="button"
          onClick={() => {
            setSelectedIcon(member.iconName);
            setEditing(true);
          }}
          className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border-tertiary)] bg-[var(--bg-primary)] text-[var(--text-secondary)] shadow-sm hover:text-[var(--text-primary)] cursor-pointer"
          title="Change icon"
        >
          <Pencil className="h-2.5 w-2.5" />
        </button>
      )}
      {editing && (
        <div className="absolute left-0 top-full z-10 mt-2 w-52 rounded-[var(--radius-md)] border border-[var(--border-tertiary)] bg-[var(--bg-elevated)] p-3 shadow-lg">
          <p className="mb-2.5 text-[10px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            Select icon
          </p>
          
          <div className="mb-3 grid grid-cols-4 gap-2">
            {AVAILABLE_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setSelectedIcon(icon)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md border p-1 transition-colors cursor-pointer",
                  selectedIcon === icon
                    ? "border-[var(--text-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                    : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/50 hover:text-[var(--text-primary)]"
                )}
              >
                <DynamicIcon name={icon} className="h-4.5 w-4.5" />
              </button>
            ))}
          </div>

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
