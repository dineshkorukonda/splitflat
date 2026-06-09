import { ExpenseFilters } from "@/components/expense-filters";
import { ExpensesListClient } from "@/components/expenses-list-client";
import { isAuthenticated } from "@/lib/auth";
import { getCategories, getExpenses, getMembers } from "@/lib/queries";
import { Suspense } from "react";

type ExpensesPageProps = {
  searchParams: Promise<{ member?: string; category?: string }>;
};

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const params = await searchParams;
  const [members, categories, expenses, canEdit] = await Promise.all([
    getMembers(),
    getCategories(),
    getExpenses({
      memberId: params.member,
      category: params.category,
    }),
    isAuthenticated(),
  ]);

  return (
    <>
      <Suspense fallback={null}>
        <ExpenseFilters members={members} categories={categories} />
      </Suspense>
      <ExpensesListClient
        expenses={expenses}
        members={members}
        categories={categories}
        canEdit={canEdit}
        groupByMonth
      />
    </>
  );
}
