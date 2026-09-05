/* eslint-disable @next/next/no-img-element */
import type { Work } from "@elmagd/types";

import { Card } from "@/components/ui/card";
import { assetPath } from "@/lib/config/base-path";
import { CubeIcon } from "@/components/ui/icons";

/**
 * بطاقة عمل في المعرض.
 * الصور تأتي من Supabase Storage (روابط كاملة) أو data URLs في الوضع المحلي،
 * لذلك نستخدم <img> مباشرة — والموقع static فلا يوجد محسّن صور على أي حال.
 */
export function WorkCard({ work }: { work: Work }) {
  return (
    <Card hoverable className="flex flex-col overflow-hidden">
      <div className="relative grid aspect-4/3 place-items-center overflow-hidden bg-sunk">
        {work.image ? (
          <img
            src={assetPath(work.image)}
            alt={work.title}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="ltr-num grid justify-items-center gap-1.5 text-[11px] text-soft">
            <CubeIcon className="size-6.5 stroke-edge-2" />
            IMG · {work.material}
          </span>
        )}
        {work.category ? (
          <span className="absolute top-2.5 start-2.5 rounded border border-edge bg-card px-2 py-0.5 text-[11px] text-body">
            {work.category}
          </span>
        ) : null}
      </div>

      <div className="px-4.5 py-4">
        <h3 className="mb-1.5 text-[16.5px]">{work.title}</h3>
        <p className="text-[13.5px] text-soft">{work.description}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {[work.material, work.size, work.printTime]
            .filter(Boolean)
            .map((meta) => (
              <span
                key={meta}
                className="ltr-num rounded border border-edge-2 px-1.5 py-px text-[10.5px] text-brand"
              >
                {meta}
              </span>
            ))}
        </div>
      </div>
    </Card>
  );
}
