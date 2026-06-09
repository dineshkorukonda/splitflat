export type CategoryMeta = {
  slug: string;
  label: string;
  emoji: string;
  iconClass: string;
};

export const BUILTIN_CATEGORIES: CategoryMeta[] = [
  {
    slug: "food",
    label: "Food & groceries",
    emoji: "🍕",
    iconClass: "bg-[var(--bg-warning)]",
  },
  {
    slug: "home",
    label: "Rent & maintenance",
    emoji: "🏠",
    iconClass: "bg-[var(--bg-info)]",
  },
  {
    slug: "utilities",
    label: "Utilities",
    emoji: "⚡",
    iconClass: "bg-[var(--bg-success)]",
  },
  {
    slug: "supplies",
    label: "Household supplies",
    emoji: "🧹",
    iconClass: "bg-[var(--bg-secondary)]",
  },
  {
    slug: "other",
    label: "Other",
    emoji: "📦",
    iconClass: "bg-[var(--bg-secondary)]",
  },
];

const BUILTIN_MAP = Object.fromEntries(
  BUILTIN_CATEGORIES.map((c) => [c.slug, c])
);

export function getCategoryMeta(
  slug: string,
  fromDb?: CategoryMeta[]
): CategoryMeta {
  const custom = fromDb?.find((c) => c.slug === slug);
  if (custom) {
    return { ...custom, iconClass: "bg-[var(--bg-secondary)]" };
  }
  return (
    BUILTIN_MAP[slug] ?? {
      slug: "other",
      label: "Other",
      emoji: "📦",
      iconClass: "bg-[var(--bg-secondary)]",
    }
  );
}

export function slugifyCategory(label: string): string {
  const base = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `custom-${Date.now()}`;
}
