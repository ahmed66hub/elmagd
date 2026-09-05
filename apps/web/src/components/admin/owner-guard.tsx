"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/components/providers";
import { LOGIN_ROUTE } from "@/lib/config/site";

/**
 * لا يُعرض أي جزء من اللوحة إلا لجلسة المالك.
 *
 * على استضافة static لا يوجد سيرفر يوقف الطلب قبل وصوله، لذلك هذا الحارس
 * يمنع العرض فقط. الحماية الحقيقية في Postgres: سياسات RLS تجعل هذه
 * الصفحات فارغة تمامًا لأي أحد غير المالك — لا طلبات تُقرأ ولا تعديل يُحفظ.
 */
export function OwnerGuard({ children }: { children: ReactNode }) {
  const { isReady, isOwner } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isOwner) router.replace(LOGIN_ROUTE);
  }, [isOwner, isReady, router]);

  if (!isReady || !isOwner) return null;

  return <>{children}</>;
}
