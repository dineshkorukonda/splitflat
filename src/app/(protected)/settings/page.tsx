import { SettingsPanel } from "@/components/settings-panel";

export default async function SettingsPage() {
  return (
    <>
      <div className="mb-4">
        <h1 className="text-[15px] font-semibold text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
          Theme, flat password, and account
        </p>
      </div>
      <SettingsPanel canEdit />
    </>
  );
}
