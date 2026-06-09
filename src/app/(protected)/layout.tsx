import { AppShell } from "@/components/app-shell";
import { getCategories, getMembers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [members, categories] = await Promise.all([
    getMembers(),
    getCategories(),
  ]);

  return (
    <AppShell members={members} categories={categories}>
      {children}
    </AppShell>
  );
}
