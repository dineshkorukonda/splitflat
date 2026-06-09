import { APP_NAME } from "@/lib/constants";

export function AppTitle() {
  return (
    <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
      {APP_NAME}
    </h1>
  );
}
