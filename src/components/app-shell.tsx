"use client";

import { AddExpenseForm } from "@/components/add-expense-form";
import { AppTitle } from "@/components/app-title";
import { ViewAsProvider } from "@/components/view-as-context";
import { ViewAsSelector } from "@/components/view-as-selector";
import { Button } from "@/components/ui/button";
import type { CategoryOption, Member } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const TABS = [
  { href: "/", label: "Expenses" },
  { href: "/settle", label: "Settle up" },
  { href: "/loans", label: "Loans" },
  { href: "/members", label: "Members" },
  { href: "/settings", label: "Settings" },
];

type AppShellProps = {
  members: Member[];
  categories: CategoryOption[];
  children: React.ReactNode;
};

export function AppShell({ members, categories, children }: AppShellProps) {
  const pathname = usePathname();
  const [showForm, setShowForm] = useState(false);

  const activeHref =
    pathname === "/expenses"
      ? "/"
      : TABS.find((t) => t.href === pathname)?.href ?? "/";

  return (
    <ViewAsProvider members={members}>
      <div className="mx-auto w-full max-w-[680px] px-4 py-6 sm:px-0">
        <div
          className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)]"
          style={{ boxShadow: "var(--shadow-shell)" }}
        >
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-5 py-4">
            <div className="min-w-0 flex-1">
              <AppTitle />
              <div className="mt-1.5">
                <ViewAsSelector members={members} />
              </div>
            </div>
            <Button
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={() => setShowForm((v) => !v)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add expense</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </header>

          <nav className="flex overflow-x-auto border-b border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-5">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "shrink-0 border-b-2 px-3.5 py-2.5 text-[13px] transition-colors",
                  activeHref === tab.href
                    ? "border-[var(--text-primary)] font-medium text-[var(--text-primary)]"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          <main className="min-h-[420px] bg-[var(--bg-tertiary)] px-5 py-5">
            {showForm && (
              <AddExpenseForm
                members={members}
                categories={categories}
                onClose={() => setShowForm(false)}
                onSaved={() => setShowForm(false)}
              />
            )}
            {children}
          </main>
        </div>
      </div>
    </ViewAsProvider>
  );
}
