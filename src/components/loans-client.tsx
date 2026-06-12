"use client";

import { AddLoanForm } from "@/components/add-loan-form";
import { LoanRow } from "@/components/loan-row";
import { Button } from "@/components/ui/button";
import { useViewAs } from "@/components/view-as-context";
import type { PersonalDebtWithDetails } from "@/lib/personal-debt";
import type { Member } from "@/lib/queries";
import { HandCoins } from "lucide-react";
import { useState } from "react";

type LoansClientProps = {
  debts: PersonalDebtWithDetails[];
  members: Member[];
};

export function LoansClient({ debts, members }: LoansClientProps) {
  const { memberId } = useViewAs();
  const [showForm, setShowForm] = useState(false);

  // Filter debts to show only those involving the viewed user
  const myDebts = debts.filter(
    (d) => d.lenderId === memberId || d.borrowerId === memberId
  );

  const activeDebts = myDebts.filter((d) => d.remaining > 0.01);
  const repaidDebts = myDebts.filter((d) => d.remaining <= 0.01);

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
        <Button size="sm" onClick={() => setShowForm((v) => !v)} className="cursor-pointer">
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

      <div className="space-y-6">
        {/* Active Loans */}
        <div>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            Active Loans ({activeDebts.length})
          </div>
          {activeDebts.length > 0 ? (
            <div className="flex flex-col gap-2">
              {activeDebts.map((debt) => (
                <LoanRow key={debt.id} debt={debt} />
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center gap-2 py-8 text-center bg-[var(--bg-primary)] border border-[var(--border-tertiary)] rounded-[var(--radius-lg)]">
              <HandCoins className="h-7 w-7 text-[var(--text-secondary)]" />
              <p className="text-[13px] font-medium text-[var(--text-primary)]">
                No active loans
              </p>
            </div>
          )}
        </div>

        {/* Repaid / Settled Loans */}
        {repaidDebts.length > 0 && (
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
              Fully Repaid ({repaidDebts.length})
            </div>
            <div className="flex flex-col gap-2 opacity-80">
              {repaidDebts.map((debt) => (
                <LoanRow key={debt.id} debt={debt} />
              ))}
            </div>
          </div>
        )}
      </div>

      {myDebts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <HandCoins className="h-10 w-10 text-[var(--text-secondary)]" />
          <p className="text-[14px] font-medium text-[var(--text-primary)]">
            No loans recorded yet
          </p>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Record direct roommate cash transfers to track them here.
          </p>
        </div>
      )}
    </>
  );
}
