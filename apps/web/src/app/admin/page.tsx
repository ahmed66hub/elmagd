"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * /admin مجرد تحويلة إلى أول تبويب.
 * التحويل في المتصفح لأن الموقع static ولا يوجد سيرفر يُصدر redirect.
 */
export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/orders");
  }, [router]);

  return null;
}
