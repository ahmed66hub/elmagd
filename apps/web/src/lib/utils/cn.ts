import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** دمج class names مع حل تعارضات Tailwind (آخر قيمة تفوز). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
