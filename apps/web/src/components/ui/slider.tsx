"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  /** القيمة كما تُعرض للمستخدم (مثل "0.20 mm"). */
  display: ReactNode;
}

export function Slider({ label, display, className, id, ...props }: SliderProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-[13px] text-soft">
        <label htmlFor={inputId}>{label}</label>
        <b className="ltr-num text-[12.5px] text-brand">{display}</b>
      </div>
      <input
        id={inputId}
        type="range"
        className={cn("range-brand", className)}
        {...props}
      />
    </div>
  );
}
