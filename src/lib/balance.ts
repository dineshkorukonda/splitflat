import { db } from "@/db";
import { expenseSplits, expenses, members, settlements } from "@/db/schema";
import { parseAmount, roundMoney } from "@/lib/format";
import { eq, sql } from "drizzle-orm";

export type MemberBalance = {
  memberId: string;
  name: string;
  iconName: string;
  colorCode: string;
  totalPaid: number;
  totalOwed: number;
  settlementsSent: number;
  settlementsReceived: number;
  balance: number;
};

export type Transfer = {
  fromId: string;
  toId: string;
  amount: number;
};

export type TransferWithNames = Transfer & {
  fromName: string;
  toName: string;
  breakdown?: {
    description: string;
    amount: number;
    date: string;
    isPositive: boolean;
  }[];
};

async function sumByMember(
  query: Promise<{ memberId: string; total: string }[]>
): Promise<Map<string, number>> {
  const rows = await query;
  return new Map(rows.map((r) => [r.memberId, parseAmount(r.total)]));
}

/** Replay the ledger: paid − owed + sent − received. Positive = owed money. */
export async function computeBalances(): Promise<Record<string, number>> {
  const [allMembers, paidMap, owedMap, sentMap, receivedMap] = await Promise.all([
    db.select().from(members),
    sumByMember(
      db
        .select({
          memberId: expenses.paidBy,
          total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
        })
        .from(expenses)
        .groupBy(expenses.paidBy)
    ),
    sumByMember(
      db
        .select({
          memberId: expenseSplits.memberId,
          total: sql<string>`coalesce(sum(${expenseSplits.share}), 0)`,
        })
        .from(expenseSplits)
        .groupBy(expenseSplits.memberId)
    ),
    sumByMember(
      db
        .select({
          memberId: settlements.fromId,
          total: sql<string>`coalesce(sum(${settlements.amount}), 0)`,
        })
        .from(settlements)
        .groupBy(settlements.fromId)
    ),
    sumByMember(
      db
        .select({
          memberId: settlements.toId,
          total: sql<string>`coalesce(sum(${settlements.amount}), 0)`,
        })
        .from(settlements)
        .groupBy(settlements.toId)
    ),
  ]);

  const balances: Record<string, number> = {};
  for (const member of allMembers) {
    const p = paidMap.get(member.id) ?? 0;
    const o = owedMap.get(member.id) ?? 0;
    const s = sentMap.get(member.id) ?? 0;
    const r = receivedMap.get(member.id) ?? 0;
    balances[member.id] = roundMoney(p - o + s - r);
  }
  return balances;
}

export async function getMemberBalances(): Promise<MemberBalance[]> {
  const [allMembers, paidMap, owedMap, sentMap, receivedMap] = await Promise.all([
    db.select().from(members).orderBy(members.name),
    sumByMember(
      db
        .select({
          memberId: expenses.paidBy,
          total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
        })
        .from(expenses)
        .groupBy(expenses.paidBy)
    ),
    sumByMember(
      db
        .select({
          memberId: expenseSplits.memberId,
          total: sql<string>`coalesce(sum(${expenseSplits.share}), 0)`,
        })
        .from(expenseSplits)
        .groupBy(expenseSplits.memberId)
    ),
    sumByMember(
      db
        .select({
          memberId: settlements.fromId,
          total: sql<string>`coalesce(sum(${settlements.amount}), 0)`,
        })
        .from(settlements)
        .groupBy(settlements.fromId)
    ),
    sumByMember(
      db
        .select({
          memberId: settlements.toId,
          total: sql<string>`coalesce(sum(${settlements.amount}), 0)`,
        })
        .from(settlements)
        .groupBy(settlements.toId)
    ),
  ]);

  return allMembers.map((m) => {
    const totalPaid = paidMap.get(m.id) ?? 0;
    const totalOwed = owedMap.get(m.id) ?? 0;
    const settlementsSent = sentMap.get(m.id) ?? 0;
    const settlementsReceived = receivedMap.get(m.id) ?? 0;
    const balance = roundMoney(
      totalPaid - totalOwed + settlementsSent - settlementsReceived
    );
    return {
      memberId: m.id,
      name: m.name,
      iconName: m.iconName,
      colorCode: m.colorCode,
      totalPaid,
      totalOwed,
      settlementsSent,
      settlementsReceived,
      balance,
    };
  });
}

export async function getMemberNameMap(): Promise<Record<string, string>> {
  const rows = await db
    .select({ id: members.id, name: members.name })
    .from(members);
  return Object.fromEntries(rows.map((r) => [r.id, r.name]));
}

export function minimizeTransfers(
  balances: Record<string, number>,
  memberMap: Record<string, string>
): TransferWithNames[] {
  const rounded: Record<string, number> = {};
  for (const [id, bal] of Object.entries(balances)) {
    rounded[id] = roundMoney(bal);
  }

  const creditors = Object.entries(rounded)
    .filter(([, v]) => v > 0.01)
    .sort((a, b) => b[1] - a[1]);

  const debtors = Object.entries(rounded)
    .filter(([, v]) => v < -0.01)
    .sort((a, b) => a[1] - b[1]);

  const transfers: TransferWithNames[] = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const [credId, credAmt] = creditors[i];
    const [debtId, debtAmt] = debtors[j];
    const amount = Math.min(credAmt, Math.abs(debtAmt));
    const roundedAmount = roundMoney(amount);

    if (roundedAmount > 0.01) {
      transfers.push({
        fromId: debtId,
        fromName: memberMap[debtId] ?? "Unknown",
        toId: credId,
        toName: memberMap[credId] ?? "Unknown",
        amount: roundedAmount,
      });
    }

    creditors[i] = [credId, roundMoney(credAmt - amount)];
    debtors[j] = [debtId, roundMoney(debtAmt + amount)];

    if (creditors[i][1] < 0.01) i++;
    if (Math.abs(debtors[j][1]) < 0.01) j++;
  }

  return transfers;
}

export async function computeDirectTransfers(): Promise<TransferWithNames[]> {
  const [allMembers, splitsQuery, settlementsQuery] = await Promise.all([
    db.select().from(members).orderBy(members.name),
    db
      .select({
        payerId: expenses.paidBy,
        borrowerId: expenseSplits.memberId,
        share: expenseSplits.share,
        description: expenses.description,
        date: expenses.date,
      })
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id)),
    db
      .select({
        fromId: settlements.fromId,
        toId: settlements.toId,
        amount: settlements.amount,
        note: settlements.note,
        settledAt: settlements.settledAt,
      })
      .from(settlements),
  ]);

  const memberMap = Object.fromEntries(allMembers.map((m) => [m.id, m.name]));

  const expenseOwed = new Map<string, number>(); // key: `${payerId}-${borrowerId}`
  for (const row of splitsQuery) {
    const key = `${row.payerId}-${row.borrowerId}`;
    const current = expenseOwed.get(key) ?? 0;
    expenseOwed.set(key, current + parseAmount(row.share));
  }

  const settlementsSent = new Map<string, number>(); // key: `${fromId}-${toId}`
  for (const row of settlementsQuery) {
    const key = `${row.fromId}-${row.toId}`;
    const current = settlementsSent.get(key) ?? 0;
    settlementsSent.set(key, current + parseAmount(row.amount));
  }

  const transfers: TransferWithNames[] = [];

  for (let i = 0; i < allMembers.length; i++) {
    for (let j = i + 1; j < allMembers.length; j++) {
      const memberA = allMembers[i].id;
      const memberB = allMembers[j].id;

      const B_owes_A_expenses = expenseOwed.get(`${memberA}-${memberB}`) ?? 0;
      const A_owes_B_expenses = expenseOwed.get(`${memberB}-${memberA}`) ?? 0;

      const B_settled_A = settlementsSent.get(`${memberB}-${memberA}`) ?? 0;
      const A_settled_B = settlementsSent.get(`${memberA}-${memberB}`) ?? 0;

      const net_B_owes_A = B_owes_A_expenses - A_owes_B_expenses - B_settled_A + A_settled_B;
      const rounded = roundMoney(net_B_owes_A);

      if (Math.abs(rounded) > 0.01) {
        const debtor = rounded > 0.01 ? memberB : memberA;
        const creditor = rounded > 0.01 ? memberA : memberB;

        const breakdown: {
          description: string;
          amount: number;
          date: string;
          isPositive: boolean;
        }[] = [];

        // 1. Splits paid by creditor where debtor participating (increases debt)
        const plusSplits = splitsQuery.filter(
          (s) => s.payerId === creditor && s.borrowerId === debtor
        );
        for (const s of plusSplits) {
          breakdown.push({
            description: s.description,
            amount: parseAmount(s.share),
            date: s.date,
            isPositive: true,
          });
        }

        // 2. Splits paid by debtor where creditor participating (decreases debt)
        const minusSplits = splitsQuery.filter(
          (s) => s.payerId === debtor && s.borrowerId === creditor
        );
        for (const s of minusSplits) {
          breakdown.push({
            description: s.description,
            amount: parseAmount(s.share),
            date: s.date,
            isPositive: false,
          });
        }

        // 3. Settlements from debtor to creditor (decreases debt)
        const minusSettlements = settlementsQuery.filter(
          (s) => s.fromId === debtor && s.toId === creditor
        );
        for (const s of minusSettlements) {
          breakdown.push({
            description: `Settlement${s.note ? `: ${s.note}` : ""}`,
            amount: parseAmount(s.amount),
            date: s.settledAt.toISOString(),
            isPositive: false,
          });
        }

        // 4. Settlements from creditor to debtor (increases debt)
        const plusSettlements = settlementsQuery.filter(
          (s) => s.fromId === creditor && s.toId === debtor
        );
        for (const s of plusSettlements) {
          breakdown.push({
            description: `Settlement${s.note ? `: ${s.note}` : ""}`,
            amount: parseAmount(s.amount),
            date: s.settledAt.toISOString(),
            isPositive: true,
          });
        }

        breakdown.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        transfers.push({
          fromId: debtor,
          fromName: memberMap[debtor] ?? "Unknown",
          toId: creditor,
          toName: memberMap[creditor] ?? "Unknown",
          amount: Math.abs(rounded),
          breakdown,
        });
      }
    }
  }

  return transfers;
}
