"use client";

import { AddLoanForm } from "@/components/add-loan-form";
import { LoanRow } from "@/components/loan-row";
import { Button } from "@/components/ui/button";
import type { PersonalDebtWithDetails } from "@/lib/personal-debt";
import type { Member } from "@/lib/queries";
import { HandCoins } from "lucide-react";
import { useState } from "react";

type LoansClientProps = {
  debts: PersonalDebtWithDetails[];
  members: Member[];
};

export function LoansClient({ debts, members }: LoansClientProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[15px] font-semibold text-[var(--text-primary)]">
            Personal loans
          </h1>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
            One-on-one cash lent between flatmates — separate from shared
            expenses
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Add loan"}
        </Button>
      </div>

      {showForm && (
        <AddLoanForm
          members={members}
          onClose={() => setShowForm(false)}
          onSaved={() => setShowForm(false)}
        />
      )}

      {debts.length > 0 ? (
        <div className="flex flex-col gap-2">
          {debts.map((debt) => (
            <LoanRow key={debt.id} debt={debt} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <HandCoins className="h-10 w-10 text-[var(--text-secondary)]" />
          <p className="text-[14px] font-medium text-[var(--text-primary)]">
            No personal loans
          </p>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Record when someone lends cash directly to another flatmate.
          </p>
        </div>
      )}
    </>
  );
}
