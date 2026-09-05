"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { PageKey } from "@elmagd/types";

import { useContent } from "@/components/providers";

/**
 * الصفحة المُخفاة من لوحة التحكم لا تُعرض حتى لو فُتح رابطها مباشرة.
 * إخفاء تنظيمي لا أمني: الموقع ملفات ثابتة، وما يُخفى هنا ليس سرًا —
 * الأسرار الحقيقية (الطلبات) لا تغادر القاعدة أصلًا إلا للمالك.
 */
export function PageGuard({ page, children }: { page: PageKey; children: ReactNode }) {
  const { content, isReady } = useContent();
  const router = useRouter();
  const isEnabled = content.settings.pages[page];

  useEffect(() => {
    if (isReady && !isEnabled) router.replace("/");
  }, [isEnabled, isReady, router]);

  if (!isEnabled) return null;
  return <>{children}</>;
}
