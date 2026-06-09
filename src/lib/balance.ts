import { roundMoney } from "@/lib/format";

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

export function computeMemberBalance(data: {
  memberId: string;
  name: string;
  emoji: string;
  colorCode: string;
  totalPaid: number;
  totalOwed: number;
  settlementsSent: number;
  settlementsReceived: number;
}): MemberBalance {
  const balance = roundMoney(
    data.totalPaid -
      data.totalOwed -
      data.settlementsSent +
      data.settlementsReceived
  );
  return { ...data, balance };
}

export type Transfer = {
  fromId: string;
  toId: string;
  amount: number;
};

export function minimizeTransfers(
  balances: Record<string, number>
): Transfer[] {
  const creditors: [string, number][] = [];
  const debtors: [string, number][] = [];

  for (const [id, value] of Object.entries(balances)) {
    const rounded = roundMoney(value);
    if (rounded > 0.01) creditors.push([id, rounded]);
    else if (rounded < -0.01) debtors.push([id, Math.abs(rounded)]);
  }

  creditors.sort((a, b) => b[1] - a[1]);
  debtors.sort((a, b) => b[1] - a[1]);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const [fromId, debtRemaining] = debtors[i];
    const [toId, creditRemaining] = creditors[j];
    const amount = roundMoney(Math.min(debtRemaining, creditRemaining));

    if (amount > 0.01) {
      transfers.push({ fromId, toId, amount });
    }

    debtors[i][1] = roundMoney(debtRemaining - amount);
    creditors[j][1] = roundMoney(creditRemaining - amount);

    if (debtors[i][1] <= 0.01) i++;
    if (creditors[j][1] <= 0.01) j++;
  }

  return transfers;
}
