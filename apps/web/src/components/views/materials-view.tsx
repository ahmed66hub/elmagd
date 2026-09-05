"use client";

import { useContent } from "@/components/providers";
import { MaterialCard } from "@/components/site/material-card";
import { Section, SectionLead, Wrap } from "@/components/ui/section";
import { SpecTable } from "@/components/ui/spec-table";

export function MaterialsView() {
  const { content } = useContent();
  const { currency, setupFee, hourlyRate } = content.settings.pricing;

  return (
    <Section>
      <Wrap>
        <SectionLead
          kicker="MATERIALS"
          title={content.settings.labels.materials}
          text="الأسعار والخصائص هنا هي نفسها التي تغذّي حاسبة السعر في المعاين."
        />

        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
          {content.materials.map((material) => (
            <MaterialCard key={material.id} material={material} currency={currency} />
          ))}
        </div>

        <SpecTable
          className="mt-6"
          rows={[
            { label: "رسوم التجهيز لكل طلب", value: `${setupFee} ${currency}` },
            { label: "سعر ساعة التشغيل", value: `${hourlyRate} ${currency}` },
          ]}
        />
      </Wrap>
    </Section>
  );
}
