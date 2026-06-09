import { format, isToday, isYesterday, parseISO } from "date-fns";

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function parseAmount(value: string | number): number {
  return typeof value === "number" ? value : parseFloat(value);
}

export function formatCurrency(amount: number): string {
  const rounded = roundMoney(amount);
  const abs = Math.abs(rounded);
  const formatted = abs.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  if (rounded > 0.01) return `+₹${formatted}`;
  if (rounded < -0.01) return `−₹${formatted}`;
  return `₹${formatted}`;
}

export function formatCurrencyPlain(amount: number): string {
  return `₹${roundMoney(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatExpenseDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

export function formatMonthYear(dateStr: string): string {
  return format(parseISO(dateStr), "MMMM yyyy");
}
