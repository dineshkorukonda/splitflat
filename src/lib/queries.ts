import { db } from "@/db";
import {
  categories,
  expenseSplits,
  expenses,
  members,
  settlements,
} from "@/db/schema";
import { getCategoryMeta, type CategoryMeta } from "@/lib/categories";
import {
  computeMemberBalance,
  minimizeTransfers,
  type MemberBalance,
  type Transfer,
} from "@/lib/balance";
import { parseAmount } from "@/lib/format";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";

export type Member = {
  id: string;
  name: string;
  emoji: string;
  colorCode: string;
};

export type CategoryOption = CategoryMeta;

export type ExpenseWithDetails = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paidBy: Member;
  splits: { member: Member; share: number }[];
};

export async function getMembers(): Promise<Member[]> {
  const rows = await db.select().from(members).orderBy(members.name);
  return rows.map((m) => ({
    id: m.id,
    name: m.name,
    emoji: m.emoji,
    colorCode: m.colorCode,
  }));
}

export async function getCategories(): Promise<CategoryOption[]> {
  const rows = await db.select().from(categories).orderBy(categories.label);
  return rows.map((c) => getCategoryMeta(c.slug));
}

export async function getMemberBalances(): Promise<MemberBalance[]> {
  const allMembers = await getMembers();

  const paidRows = await db
    .select({
      memberId: expenses.paidBy,
      total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .groupBy(expenses.paidBy);

  const owedRows = await db
    .select({
      memberId: expenseSplits.memberId,
      total: sql<string>`coalesce(sum(${expenseSplits.share}), 0)`,
    })
    .from(expenseSplits)
    .groupBy(expenseSplits.memberId);

  const sentRows = await db
    .select({
      memberId: settlements.fromId,
      total: sql<string>`coalesce(sum(${settlements.amount}), 0)`,
    })
    .from(settlements)
    .groupBy(settlements.fromId);

  const receivedRows = await db
    .select({
      memberId: settlements.toId,
      total: sql<string>`coalesce(sum(${settlements.amount}), 0)`,
    })
    .from(settlements)
    .groupBy(settlements.toId);

  const paidMap = new Map(
    paidRows.map((r) => [r.memberId, parseAmount(r.total)])
  );
  const owedMap = new Map(
    owedRows.map((r) => [r.memberId, parseAmount(r.total)])
  );
  const sentMap = new Map(
    sentRows.map((r) => [r.memberId, parseAmount(r.total)])
  );
  const receivedMap = new Map(
    receivedRows.map((r) => [r.memberId, parseAmount(r.total)])
  );

  return allMembers.map((m) =>
    computeMemberBalance({
      memberId: m.id,
      name: m.name,
      emoji: m.emoji,
      colorCode: m.colorCode,
      totalPaid: paidMap.get(m.id) ?? 0,
      totalOwed: owedMap.get(m.id) ?? 0,
      settlementsSent: sentMap.get(m.id) ?? 0,
      settlementsReceived: receivedMap.get(m.id) ?? 0,
    })
  );
}

export type SettledBatch = {
  id: string;
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  fromEmoji: string;
  toEmoji: string;
  fromColor: string;
  toColor: string;
  amount: number;
  settledAt: Date;
};

export async function getSettledBatches(): Promise<SettledBatch[]> {
  const rows = await db
    .select()
    .from(settlements)
    .orderBy(desc(settlements.settledAt));

  if (rows.length === 0) return [];

  const allMembers = await getMembers();
  const memberMap = new Map(allMembers.map((m) => [m.id, m]));

  return rows.map((row) => {
    const from = memberMap.get(row.fromId)!;
    const to = memberMap.get(row.toId)!;
    return {
      id: row.id,
      fromId: row.fromId,
      toId: row.toId,
      fromName: from.name,
      toName: to.name,
      fromEmoji: from.emoji,
      toEmoji: to.emoji,
      fromColor: from.colorCode,
      toColor: to.colorCode,
      amount: parseAmount(row.amount),
      settledAt: row.settledAt,
    };
  });
}

export async function getMinimizedTransfers(): Promise<
  (Transfer & {
    fromName: string;
    toName: string;
    fromEmoji: string;
    toEmoji: string;
    fromColor: string;
    toColor: string;
  })[]
> {
  const balances = await getMemberBalances();
  const balanceMap = Object.fromEntries(
    balances.map((b) => [b.memberId, b.balance])
  );
  const memberMap = new Map(balances.map((b) => [b.memberId, b]));
  const transfers = minimizeTransfers(balanceMap);

  return transfers.map((t) => {
    const from = memberMap.get(t.fromId)!;
    const to = memberMap.get(t.toId)!;
    return {
      ...t,
      fromName: from.name,
      toName: to.name,
      fromEmoji: from.emoji,
      toEmoji: to.emoji,
      fromColor: from.colorCode,
      toColor: to.colorCode,
    };
  });
}

export async function getExpenses(options?: {
  limit?: number;
  memberId?: string;
  category?: string;
  monthStart?: string;
  monthEnd?: string;
}): Promise<ExpenseWithDetails[]> {
  const conditions = [];

  if (options?.memberId) {
    conditions.push(eq(expenses.paidBy, options.memberId));
  }
  if (options?.category) {
    conditions.push(eq(expenses.category, options.category));
  }
  if (options?.monthStart) {
    conditions.push(gte(expenses.date, options.monthStart));
  }
  if (options?.monthEnd) {
    conditions.push(lte(expenses.date, options.monthEnd));
  }

  let query = db
    .select()
    .from(expenses)
    .orderBy(desc(expenses.date), desc(expenses.createdAt))
    .$dynamic();

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const expenseRows = await query;
  if (expenseRows.length === 0) return [];

  const allMembers = await getMembers();
  const memberMap = new Map(allMembers.map((m) => [m.id, m]));

  const expenseIds = expenseRows.map((e) => e.id);
  const splitRows = await db
    .select()
    .from(expenseSplits)
    .where(inArray(expenseSplits.expenseId, expenseIds));

  const splitsByExpense = new Map<string, typeof splitRows>();
  for (const split of splitRows) {
    const existing = splitsByExpense.get(split.expenseId) ?? [];
    existing.push(split);
    splitsByExpense.set(split.expenseId, existing);
  }

  return expenseRows.map((e) => ({
    id: e.id,
    description: e.description,
    amount: parseAmount(e.amount),
    category: e.category,
    date: e.date,
    paidBy: memberMap.get(e.paidBy)!,
    splits: (splitsByExpense.get(e.id) ?? []).map((s) => ({
      member: memberMap.get(s.memberId)!,
      share: parseAmount(s.share),
    })),
  }));
}

export async function getExpenseById(
  id: string
): Promise<ExpenseWithDetails | null> {
  const results = await getExpenses();
  return results.find((e) => e.id === id) ?? null;
}

export async function getMonthlyTotal(monthStart: string, monthEnd: string) {
  const rows = await db
    .select({
      total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(
      and(gte(expenses.date, monthStart), lte(expenses.date, monthEnd))
    );

  return parseAmount(rows[0]?.total ?? "0");
}

export async function getMemberShareForMonth(
  memberId: string,
  monthStart: string,
  monthEnd: string
) {
  const rows = await db
    .select({
      total: sql<string>`coalesce(sum(${expenseSplits.share}), 0)`,
    })
    .from(expenseSplits)
    .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
    .where(
      and(
        eq(expenseSplits.memberId, memberId),
        gte(expenses.date, monthStart),
        lte(expenses.date, monthEnd)
      )
    );

  return parseAmount(rows[0]?.total ?? "0");
}
