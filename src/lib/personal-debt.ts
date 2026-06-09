import { db } from "@/db";
import { members, personalDebtPayments, personalDebts } from "@/db/schema";
import { parseAmount, roundMoney } from "@/lib/format";
import { desc, eq, sql } from "drizzle-orm";

export type PersonalDebtWithDetails = {
  id: string;
  lenderId: string;
  borrowerId: string;
  lenderName: string;
  borrowerName: string;
  lenderEmoji: string;
  borrowerEmoji: string;
  lenderColor: string;
  borrowerColor: string;
  principal: number;
  repaid: number;
  remaining: number;
  note: string | null;
  createdAt: Date;
};

export async function getPersonalDebts(): Promise<PersonalDebtWithDetails[]> {
  const rows = await db
    .select()
    .from(personalDebts)
    .orderBy(desc(personalDebts.createdAt));

  if (rows.length === 0) return [];

  const allMembers = await db.select().from(members);
  const memberMap = new Map(allMembers.map((m) => [m.id, m]));

  const paymentRows = await db
    .select({
      debtId: personalDebtPayments.debtId,
      total: sql<string>`coalesce(sum(${personalDebtPayments.amount}), 0)`,
    })
    .from(personalDebtPayments)
    .groupBy(personalDebtPayments.debtId);

  const repaidMap = new Map(
    paymentRows.map((r) => [r.debtId, parseAmount(r.total)])
  );

  return rows
    .map((row) => {
      const lender = memberMap.get(row.lenderId)!;
      const borrower = memberMap.get(row.borrowerId)!;
      const principal = parseAmount(row.amount);
      const repaid = repaidMap.get(row.id) ?? 0;
      const remaining = roundMoney(principal - repaid);

      return {
        id: row.id,
        lenderId: row.lenderId,
        borrowerId: row.borrowerId,
        lenderName: lender.name,
        borrowerName: borrower.name,
        lenderEmoji: lender.emoji,
        borrowerEmoji: borrower.emoji,
        lenderColor: lender.colorCode,
        borrowerColor: borrower.colorCode,
        principal,
        repaid,
        remaining,
        note: row.note,
        createdAt: row.createdAt,
      };
    })
    .filter((d) => d.remaining > 0.01);
}

export async function getPersonalDebtRemaining(
  debtId: string
): Promise<number> {
  const [debt] = await db
    .select()
    .from(personalDebts)
    .where(eq(personalDebts.id, debtId))
    .limit(1);

  if (!debt) throw new Error("Loan not found");

  const paymentRows = await db
    .select({
      total: sql<string>`coalesce(sum(${personalDebtPayments.amount}), 0)`,
    })
    .from(personalDebtPayments)
    .where(eq(personalDebtPayments.debtId, debtId));

  const repaid = parseAmount(paymentRows[0]?.total ?? "0");
  return roundMoney(parseAmount(debt.amount) - repaid);
}
