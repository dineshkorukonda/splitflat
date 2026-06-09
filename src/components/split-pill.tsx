import { MemberAvatar } from "@/components/member-avatar";
import type { Member } from "@/lib/queries";

type SplitPillProps = {
  members: Member[];
};

export function SplitPill({ members }: SplitPillProps) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
      {members.map((m) => (
        <MemberAvatar
          key={m.id}
          name={m.name}
          emoji={m.emoji}
          colorCode={m.colorCode}
          className="!mr-0 !border-0"
        />
      ))}
      <span className="ml-0.5">÷ {members.length}</span>
    </span>
  );
}
