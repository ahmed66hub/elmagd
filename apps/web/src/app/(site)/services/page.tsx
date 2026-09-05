import type { Metadata } from "next";

import { PageGuard } from "@/components/site/page-guard";
import { ServicesView } from "@/components/views/services-view";

export const metadata: Metadata = {
  title: "الخدمات",
  description:
    "طباعة من ملفك، تصميم ونمذجة 3D، هندسة عكسية لقطع الغيار، ماكيتات معمارية، دروع وهدايا الشركات، وقطع Cosplay بمقاس حقيقي.",
};

export default function ServicesPage() {
  return (
    <PageGuard page="services">
      <ServicesView />
    </PageGuard>
  );
}
