"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const CONTROL =
  "w-full rounded-[5px] border border-edge bg-card px-3.5 py-2.5 transition-all duration-200 placeholder:text-soft/70 focus:border-brand focus:ring-3 focus:ring-brand-soft focus:outline-none";

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3.5", className)}>
      {label ? (
        <span className="mb-1.5 block text-[13.5px] text-soft">{label}</span>
      ) : null}
      {children}
      {hint && !error ? <p className="mt-1 text-[11.5px] text-soft">{hint}</p> : null}
      {error ? (
        <p className="mt-1 text-[11.5px] text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export function TextInput({
  label,
  hint,
  error,
  className,
  wrapperClassName,
  id,
  ...props
}: TextInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn("mb-3.5", wrapperClassName)}>
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-[13.5px] text-soft">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(CONTROL, error && "border-danger", className)}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {hint && !error ? <p className="mt-1 text-[11.5px] text-soft">{hint}</p> : null}
      {error ? (
        <p className="mt-1 text-[11.5px] text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export function TextArea({
  label,
  hint,
  error,
  className,
  wrapperClassName,
  id,
  ...props
}: TextAreaProps) {
  const generatedId = useId();
  const areaId = id ?? generatedId;

  return (
    <div className={cn("mb-3.5", wrapperClassName)}>
      {label ? (
        <label htmlFor={areaId} className="mb-1.5 block text-[13.5px] text-soft">
          {label}
        </label>
      ) : null}
      <textarea
        id={areaId}
        className={cn(CONTROL, "min-h-28 resize-y", error && "border-danger", className)}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {hint && !error ? <p className="mt-1 text-[11.5px] text-soft">{hint}</p> : null}
      {error ? (
        <p className="mt-1 text-[11.5px] text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
