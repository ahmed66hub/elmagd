import type { ReactNode } from "react";

/** ترويسة موحّدة لكل تبويب في لوحة التحكم. */
export function AdminPane({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1 text-[19px]">{title}</h2>
      <p className="mb-5 text-[13.5px] text-soft">{subtitle}</p>
      {children}
    </section>
  );
}

/** صفّان جنبًا إلى جنب على الشاشات الواسعة. */
export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-3.5 md:grid-cols-2">{children}</div>;
}
