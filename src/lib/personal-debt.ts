import { db } from "@/db";
import { members, personalDebtPayments, personalDebts } from "@/db/schema";
import { parseAmount, roundMoney } from "@/lib/format";
import { desc, eq, sql } from "drizzle-orm";

export type PersonalDebtRepayment = {
  id: string;
  amount: number;
  paidAt: string;
};

export type PersonalDebtWithDetails = {
  id: string;
  lenderId: string;
  borrowerId: string;
  lenderName: string;
  borrowerName: string;
  lenderIcon: string;
  borrowerIcon: string;
  lenderColor: string;
  borrowerColor: string;
  principal: number;
  repaid: number;
  remaining: number;
  note: string | null;
  createdAt: Date;
  payments: PersonalDebtRepayment[];
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

  const allPayments = await db
    .select()
    .from(personalDebtPayments)
    .orderBy(desc(personalDebtPayments.paidAt));

  const paymentsByDebt = new Map<string, typeof allPayments>();
  for (const pay of allPayments) {
    const existing = paymentsByDebt.get(pay.debtId) ?? [];
    existing.push(pay);
    paymentsByDebt.set(pay.debtId, existing);
  }

  return rows.map((row) => {
    const lender = memberMap.get(row.lenderId)!;
    const borrower = memberMap.get(row.borrowerId)!;
    const principal = parseAmount(row.amount);
    const repaid = repaidMap.get(row.id) ?? 0;
    const remaining = roundMoney(principal - repaid);
    const debtPayments = (paymentsByDebt.get(row.id) ?? []).map((p) => ({
      id: p.id,
      amount: parseAmount(p.amount),
      paidAt: p.paidAt.toISOString(),
    }));

    return {
      id: row.id,
      lenderId: row.lenderId,
      borrowerId: row.borrowerId,
      lenderName: lender.name,
      borrowerName: borrower.name,
      lenderIcon: lender.iconName,
      borrowerIcon: borrower.iconName,
      lenderColor: lender.colorCode,
      borrowerColor: borrower.colorCode,
      principal,
      repaid,
      remaining,
      note: row.note,
      createdAt: row.createdAt,
      payments: debtPayments,
    };
  });
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
