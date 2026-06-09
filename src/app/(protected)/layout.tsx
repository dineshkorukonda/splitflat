import { AppShell } from "@/components/app-shell";
import { isAuthenticated } from "@/lib/auth";
import { getCategories, getMembers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [members, categories, canEdit] = await Promise.all([
    getMembers(),
    getCategories(),
    isAuthenticated(),
  ]);

  return (
    <AppShell members={members} categories={categories} canEdit={canEdit}>
      {children}
    </AppShell>
  );
}
