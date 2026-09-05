import type { Material } from "@elmagd/types";

import { Card } from "@/components/ui/card";
import { Meter, SpecTable } from "@/components/ui/spec-table";

export function MaterialCard({
  material,
  currency,
}: {
  material: Material;
  currency: string;
}) {
  return (
    <Card hoverable className="p-5">
      <div className="ltr-num text-[17px] text-ink">{material.name}</div>
      <p className="mt-1.5 mb-3.5 min-h-[42px] text-[13.5px] text-soft">
        {material.tagline}
      </p>

      <Meter label="المتانة" value={material.strength} />
      <Meter label="مقاومة الحرارة" value={material.heatResistance} />

      <SpecTable
        className="mt-3.5"
        rows={[
          { label: "سعر الجرام", value: `${material.pricePerGram} ${currency}` },
          { label: "الكثافة", value: `${material.density} g/cm³` },
        ]}
      />
    </Card>
  );
}
