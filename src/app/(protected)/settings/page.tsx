import { SettingsPanel } from "@/components/settings-panel";
import { getMembers } from "@/lib/queries";

export default async function SettingsPage() {
  const members = await getMembers();

  return (
    <>
      <div className="mb-4">
        <h1 className="text-[15px] font-semibold text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
          Theme, passwords, and account settings
        </p>
      </div>
      <SettingsPanel canEdit members={members} />
    </>
  );
}
