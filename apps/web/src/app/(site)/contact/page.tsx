import type { Metadata } from "next";

import { PageGuard } from "@/components/site/page-guard";
import { ContactView } from "@/components/views/contact-view";

export const metadata: Metadata = {
  title: "تواصل",
  description:
    "ابعت ملفك أو فكرتك على واتساب ويوصلك السعر والمدة في نفس اليوم — بدون دفع أونلاين.",
};

export default function ContactPage() {
  return (
    <PageGuard page="contact">
      <ContactView />
    </PageGuard>
  );
}
