import type { Metadata } from "next";

import { PageGuard } from "@/components/site/page-guard";
import { ViewerView } from "@/components/views/viewer-view";

export const metadata: Metadata = {
  title: "المعاين 3D",
  description:
    "ارفع ملف STL وشاهده بكل الزوايا داخل متصفحك، واعرف الوزن وزمن الطباعة والسعر التقديري فورًا.",
};

export default function ViewerPage() {
  return (
    <PageGuard page="viewer">
      <ViewerView />
    </PageGuard>
  );
}
