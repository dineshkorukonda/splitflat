"use client";

import { addCategory } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import type { CategoryOption } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

const ADD_NEW = "__add_new__";

type CategorySelectProps = {
  categories: CategoryOption[];
  value: string;
  onChange: (slug: string) => void;
};

const CATEGORY_ICONS = [
  "Tag",
  "Pizza",
  "Home",
  "Zap",
  "Brush",
  "Package",
  "Gift",
  "Car",
  "Heart",
  "Smile",
];

export function CategorySelect({
  categories,
  value,
  onChange,
}: CategorySelectProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState("");
  const [iconName, setIconName] = useState("Tag");
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (v: string) => {
    if (v === ADD_NEW) {
      setShowAdd(true);
      return;
    }
    onChange(v);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const slug = await addCategory(label, iconName);
        onChange(slug);
        setShowAdd(false);
        setLabel("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add category");
      }
    });
  };

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={handleSelect}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.slug} value={c.slug}>
              <span className="flex items-center gap-1.5">
                <DynamicIcon name={c.iconName} className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                {c.label}
              </span>
            </SelectItem>
          ))}
          <SelectItem value={ADD_NEW}>➕ Add new category…</SelectItem>
        </SelectContent>
      </Select>

      {showAdd && (
        <div className="rounded-[var(--radius-md)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] p-3">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            New category
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-[100px_1fr] gap-2.5">
              <div className="flex flex-col gap-1">
                <Label>Icon</Label>
                <Select value={iconName} onValueChange={setIconName}>
                  <SelectTrigger className="bg-[var(--bg-primary)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_ICONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <span className="flex items-center gap-1.5">
                          <DynamicIcon name={icon} className="h-3.5 w-3.5" />
                          {icon}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="cat-label">Name</Label>
                <Input
                  id="cat-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Pet supplies"
                  required
                />
              </div>
            </div>
            {error && (
              <p className="text-xs text-[var(--text-danger)]">{error}</p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isPending} className="cursor-pointer">
                {isPending ? "Adding…" : "Add category"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
