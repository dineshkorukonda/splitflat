import { cn } from "@/lib/utils";

function getTextColor(bg: string): string {
  const r = parseInt(bg.slice(1, 3), 16);
  const g = parseInt(bg.slice(3, 5), 16);
  const b = parseInt(bg.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? "#333333" : "#ffffff";
}

type MemberAvatarProps = {
  name: string;
  colorCode: string;
  emoji?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-[22px] w-[22px] text-[11px]",
  md: "h-9 w-9 text-base rounded-[var(--radius-md)]",
  lg: "h-10 w-10 text-lg rounded-[var(--radius-md)]",
};

export function MemberAvatar({
  name,
  colorCode,
  emoji,
  size = "sm",
  className,
}: MemberAvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--bg-primary)] font-medium leading-none",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: colorCode, color: emoji ? undefined : getTextColor(colorCode) }}
      title={name}
    >
      {emoji ?? initial}
    </span>
  );
}
