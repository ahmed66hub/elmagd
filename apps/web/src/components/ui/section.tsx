import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** الحاوية الأفقية الموحّدة لكل الأقسام. */
export function Wrap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-6", className)}>{children}</div>;
}

export function Section({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("py-12 md:py-[70px]", className)}>{children}</section>;
}

/** ترويسة القسم: سطر لاتيني صغير + عنوان + خط + وصف. */
export function SectionLead({
  kicker,
  title,
  text,
  className,
  children,
}: {
  kicker: string;
  title: string;
  text?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("mb-8 max-w-[60ch]", className)}>
      <span className="ltr-num mb-2.5 block text-[10.5px] tracking-[0.22em] text-brand uppercase">
        {kicker}
      </span>
      <h2 className="text-2xl tracking-tight md:text-[34px]">{title}</h2>
      <div className="my-3.5 h-[3px] w-14 bg-brand" />
      {text ? <p className="text-soft">{text}</p> : null}
      {children}
    </div>
  );
}
