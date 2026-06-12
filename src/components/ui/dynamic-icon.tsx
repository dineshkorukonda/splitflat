import * as Icons from "lucide-react";

type DynamicIconProps = {
  name: string;
  className?: string;
};

export function DynamicIcon({ name, className }: DynamicIconProps) {
  // Map standard icon name to Lucide icon component.
  // Fallback to User icon if the icon is not found.
  const IconComponent = (Icons as any)[name] || Icons.User;
  return <IconComponent className={className} />;
}
