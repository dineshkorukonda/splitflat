import { SettleClient } from "@/components/settle-client";
import { getMinimizedTransfers, getSettlements } from "@/lib/queries";

export default async function SettlePage() {
  const [transfers, settlements] = await Promise.all([
    getMinimizedTransfers(),
    getSettlements(),
  ]);

  return <SettleClient transfers={transfers} settlements={settlements} />;
}
