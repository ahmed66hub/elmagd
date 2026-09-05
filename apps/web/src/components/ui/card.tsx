import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** يرفع البطاقة قليلًا ويلوّن حدّها عند المرور بالمؤشر. */
  hoverable?: boolean;
}

export function Card({ children, className, hoverable, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-edge bg-card",
        hoverable &&
          "transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
