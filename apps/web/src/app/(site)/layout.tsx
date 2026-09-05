import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/**
 * لا يُقرأ أي شيء من الطلب هنا (لا كوكيز ولا headers) عن قصد،
 * فتبقى صفحات الموقع العام static وتُقدَّم من الـ CDN مباشرة:
 * أسرع للزائر، وبلا استهلاك لحصة الدوال على الاستضافة المجانية.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
    </>
  );
}
