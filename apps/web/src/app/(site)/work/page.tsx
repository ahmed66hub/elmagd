import type { Metadata } from "next";

import { PageGuard } from "@/components/site/page-guard";
import { WorkView } from "@/components/views/work-view";

export const metadata: Metadata = {
  title: "معرض الأعمال",
  description:
    "ماكيتات معمارية، قطع وظيفية، خوذات Cosplay، دروع تكريم ومجسمات ديكور — نماذج من أعمال 3D Elmagd.",
};

export default function WorkPage() {
  return (
    <PageGuard page="work">
      <WorkView />
    </PageGuard>
  );
}
