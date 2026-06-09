import { MemberRow } from "@/components/member-row";
import { isAuthenticated } from "@/lib/auth";
import { getMemberBalances } from "@/lib/queries";

export default async function MembersPage() {
  const [balances, canEdit] = await Promise.all([
    getMemberBalances(),
    isAuthenticated(),
  ]);

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
          Flatmates
        </div>
        {canEdit && (
          <div className="text-[11px] text-[var(--text-secondary)]">
            Tap ✏️ to change icons
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {balances.map((member) => (
          <MemberRow key={member.memberId} member={member} canEdit={canEdit} />
        ))}
      </div>
    </>
  );
}
