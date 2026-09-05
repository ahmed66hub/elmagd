import type { Metadata } from "next";

import { PageGuard } from "@/components/site/page-guard";
import { FaqView } from "@/components/views/faq-view";

export const metadata: Metadata = {
  title: "أسئلة شائعة",
  description:
    "مدة التنفيذ، طريقة حساب السعر، التصميم من الصفر، متانة القطع، وسرية ملفاتك.",
};

export default function FaqPage() {
  return (
    <PageGuard page="faq">
      <FaqView />
    </PageGuard>
  );
}
