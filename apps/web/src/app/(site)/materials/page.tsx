import type { Metadata } from "next";

import { PageGuard } from "@/components/site/page-guard";
import { MaterialsView } from "@/components/views/materials-view";

export const metadata: Metadata = {
  title: "الخامات",
  description:
    "PLA وPETG وABS وTPU وPLA-CF — الخصائص وسعر الجرام والكثافة التي تغذّي حاسبة السعر.",
};

export default function MaterialsPage() {
  return (
    <PageGuard page="materials">
      <MaterialsView />
    </PageGuard>
  );
}
