import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface SpecRow {
  label: string;
  value: ReactNode;
  /** القيم العربية تُعرض بخط المتن بدل الخط اللاتيني. */
  arabic?: boolean;
}

/** جدول مواصفات بصفوف label/value — يُستخدم في الماكينة والخامات والتواصل. */
export function SpecTable({
  rows,
  className,
}: {
  rows: SpecRow[];
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-card border border-edge bg-card", className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-3.5 border-b border-edge px-4.5 py-3.5 last:border-b-0"
        >
          <span className="text-sm text-soft">{row.label}</span>
          <b className={cn("text-sm text-ink", row.arabic ? "font-body" : "ltr-num")}>
            {row.value}
          </b>
        </div>
      ))}
    </div>
  );
}

/** شريط نسبة بسيط لعرض المتانة ومقاومة الحرارة. */
export function Meter({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="mb-1.5 flex items-center gap-2.5 text-xs text-soft">
      <span className="w-[82px] shrink-0">{label}</span>
      <div
        className="h-1 flex-1 overflow-hidden rounded-full bg-sunk"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <span className="block h-full rounded-full bg-brand" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
