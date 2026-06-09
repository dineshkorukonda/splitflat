"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useViewAs } from "@/components/view-as-context";
import type { Member } from "@/lib/queries";

type ViewAsSelectorProps = {
  members: Member[];
};

export function ViewAsSelector({ members }: ViewAsSelectorProps) {
  const { memberId, setMemberId, isReady } = useViewAs();
  const selected = members.find((m) => m.id === memberId) ?? members[0];

  if (!isReady) {
    return (
      <span className="text-[12px] text-[var(--text-secondary)]">
        {selected?.emoji} View as {selected?.name ?? "…"}
      </span>
    );
  }

  return (
    <Select value={memberId} onValueChange={setMemberId}>
      <SelectTrigger className="h-8 w-auto min-w-[140px] border-0 bg-transparent text-[12px] text-[var(--text-secondary)] shadow-none">
        <SelectValue placeholder="View as" />
      </SelectTrigger>
      <SelectContent>
        {members.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            {m.emoji} View as {m.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
