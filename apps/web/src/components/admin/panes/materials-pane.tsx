"use client";

import { AdminPane, FieldRow } from "@/components/admin/admin-pane";
import { DebouncedNumber, DebouncedText } from "@/components/admin/debounced-fields";
import { ItemList } from "@/components/admin/item-list";
import { useContent } from "@/components/providers";

export function MaterialsPane() {
  const { content, updateSettings } = useContent();
  const pricing = content.settings.pricing;

  const patchPricing = (patch: Partial<typeof pricing>) =>
    void updateSettings((settings) => ({
      ...settings,
      pricing: { ...settings.pricing, ...patch },
    }));

  return (
    <AdminPane
      title="الخامات والتسعير"
      subtitle="سعر الجرام هنا يغذّي حاسبة السعر في المعاين مباشرة."
    >
      <FieldRow>
        <DebouncedNumber
          label="رسوم التجهيز لكل طلب"
          value={pricing.setupFee}
          min={0}
          onCommit={(setupFee) => patchPricing({ setupFee })}
        />
        <DebouncedNumber
          label="سعر ساعة التشغيل"
          value={pricing.hourlyRate}
          min={0}
          onCommit={(hourlyRate) => patchPricing({ hourlyRate })}
        />
      </FieldRow>

      <div className="mb-5" />

      <ItemList
        collection="materials"
        items={content.materials}
        titleOf={(material) => material.name}
        addLabel="+ إضافة خامة جديدة"
        renderFields={(material, update) => (
          <>
            <FieldRow>
              <DebouncedText
                label="اسم الخامة"
                value={material.name}
                dir="ltr"
                className="ltr-num"
                onCommit={(name) => update({ name })}
              />
              <DebouncedNumber
                label="سعر الجرام"
                value={material.pricePerGram}
                step={0.1}
                min={0}
                onCommit={(pricePerGram) => update({ pricePerGram })}
              />
            </FieldRow>

            <DebouncedText
              label="الوصف"
              value={material.tagline}
              onCommit={(tagline) => update({ tagline })}
            />

            <FieldRow>
              <DebouncedNumber
                label="الكثافة g/cm³"
                value={material.density}
                step={0.01}
                min={0}
                onCommit={(density) => update({ density })}
              />
              <DebouncedNumber
                label="المتانة %"
                value={material.strength}
                min={0}
                onCommit={(strength) => update({ strength })}
              />
            </FieldRow>

            <DebouncedNumber
              label="مقاومة الحرارة %"
              value={material.heatResistance}
              min={0}
              onCommit={(heatResistance) => update({ heatResistance })}
            />
          </>
        )}
      />
    </AdminPane>
  );
}
