import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

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
  iconName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-[22px] w-[22px] text-[10px]",
  md: "h-9 w-9 text-sm rounded-[var(--radius-md)]",
  lg: "h-10 w-10 text-base rounded-[var(--radius-md)]",
};

const iconSizes = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-5.5 w-5.5",
};

export function MemberAvatar({
  name,
  colorCode,
  iconName,
  size = "sm",
  className,
}: MemberAvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const contrastColor = getTextColor(colorCode);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--bg-primary)] font-medium leading-none",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: colorCode, color: contrastColor }}
      title={name}
    >
      {iconName ? (
        <DynamicIcon name={iconName} className={iconSizes[size]} />
      ) : (
        initial
      )}
    </span>
  );
}
