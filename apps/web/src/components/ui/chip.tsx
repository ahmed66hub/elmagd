"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  /** النصوص العربية تحتاج خط المتن بدل الخط اللاتيني أحادي المسافة. */
  arabic?: boolean;
  children: ReactNode;
}

export function Chip({ active, arabic, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "rounded-[5px] border border-edge bg-card-2 px-3.5 py-1.5 text-[12.5px] text-soft transition-colors duration-200 hover:text-ink",
        arabic ? "font-body" : "ltr-num",
        active && "border-brand bg-brand-soft text-brand",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

/** فلاتر المعرض — شكل حبة دائرية. */
export function FilterChip({ active, className, children, ...props }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "rounded-full border border-edge bg-card px-4 py-1.5 text-[13.5px] text-body transition-colors duration-200 hover:border-edge-2 hover:text-ink",
        active && "border-brand bg-brand text-white hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
