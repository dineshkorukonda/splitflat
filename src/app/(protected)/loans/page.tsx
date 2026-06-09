import { LoansClient } from "@/components/loans-client";
import { getPersonalDebts } from "@/lib/personal-debt";
import { getMembers } from "@/lib/queries";

export default async function LoansPage() {
  const [debts, members] = await Promise.all([
    getPersonalDebts(),
    getMembers(),
  ]);

  return <LoansClient debts={debts} members={members} />;
}
