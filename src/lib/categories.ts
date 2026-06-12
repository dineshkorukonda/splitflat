export type CategoryMeta = {
  slug: string;
  label: string;
  iconName: string;
  iconClass: string;
};

export const BUILTIN_CATEGORIES: CategoryMeta[] = [
  {
    slug: "food",
    label: "Food & groceries",
    iconName: "Pizza",
    iconClass: "bg-[var(--bg-warning)]",
  },
  {
    slug: "home",
    label: "Rent & maintenance",
    iconName: "Home",
    iconClass: "bg-[var(--bg-info)]",
  },
  {
    slug: "utilities",
    label: "Utilities",
    iconName: "Zap",
    iconClass: "bg-[var(--bg-success)]",
  },
  {
    slug: "supplies",
    label: "Household supplies",
    iconName: "Brush",
    iconClass: "bg-[var(--bg-secondary)]",
  },
  {
    slug: "other",
    label: "Other",
    iconName: "Package",
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
      iconName: "Package",
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
