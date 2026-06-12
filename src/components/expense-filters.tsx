"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import type { CategoryOption, Member } from "@/lib/queries";
import { useRouter, useSearchParams } from "next/navigation";

type ExpenseFiltersProps = {
  members: Member[];
  categories: CategoryOption[];
};

export function ExpenseFilters({ members, categories }: ExpenseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const memberId = searchParams.get("member") ?? "all";
  const category = searchParams.get("category") ?? "all";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/expenses?${params.toString()}`);
  };

  return (
    <div className="mb-4 flex gap-2">
      <Select value={memberId} onValueChange={(v) => updateFilter("member", v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All members" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All members</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              <span className="flex items-center gap-1.5">
                <DynamicIcon name={m.iconName} className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                {m.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={category}
        onValueChange={(v) => updateFilter("category", v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.slug} value={c.slug}>
              <span className="flex items-center gap-1.5">
                <DynamicIcon name={c.iconName} className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                {c.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
