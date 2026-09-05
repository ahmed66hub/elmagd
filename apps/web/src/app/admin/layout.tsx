import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { OwnerGuard } from "@/components/admin/owner-guard";

export const metadata: Metadata = {
  title: "لوحة التحكم",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <OwnerGuard>
      <AdminShell>{children}</AdminShell>
    </OwnerGuard>
  );
}
