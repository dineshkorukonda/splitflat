import { db } from "@/db";
import { expenseSplits, expenses, members, settlements } from "@/db/schema";
import { parseAmount, roundMoney } from "@/lib/format";
import { sql } from "drizzle-orm";

export type MemberBalance = {
  memberId: string;
  name: string;
  emoji: string;
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
      emoji: m.emoji,
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
