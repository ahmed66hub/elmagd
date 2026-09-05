"use client";

import type { Material, QuoteResult } from "@elmagd/types";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { WhatsappIcon } from "@/components/ui/icons";
import { Slider } from "@/components/ui/slider";
import { FILAMENT_COLORS } from "@/lib/config/site";
import { PRINT_LIMITS } from "@/lib/domain/pricing";
import { cn } from "@/lib/utils/cn";
import { formatDays, formatHours } from "@/lib/utils/format";

export interface PrintOptions {
  materialId: string;
  /** بالمليمتر. */
  layerHeight: number;
  infill: number;
  supports: number;
  quantity: number;
  filamentColor: string;
}

interface QuotePanelProps {
  materials: Material[];
  currency: string;
  options: PrintOptions;
  quote: QuoteResult;
  onChange: (patch: Partial<PrintOptions>) => void;
  onOrder: () => void;
}

function QuoteRow({
  label,
  value,
  arabic,
}: {
  label: string;
  value: string;
  arabic?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-1 text-[13.5px] text-soft">
      <span>{label}</span>
      <b className={cn("text-sm text-ink", arabic ? "font-body" : "ltr-num")}>{value}</b>
    </div>
  );
}

export function QuotePanel({
  materials,
  currency,
  options,
  quote,
  onChange,
  onOrder,
}: QuotePanelProps) {
  const colorName =
    FILAMENT_COLORS.find((entry) => entry.hex === options.filamentColor)?.name ?? "مخصص";

  return (
    <aside className="flex flex-col gap-4 rounded-card border border-edge bg-card p-4.5">
      <h3 className="text-[15px]">الخامة والإعدادات</h3>

      <div className="flex flex-wrap gap-1.5">
        {materials.map((material) => (
          <Chip
            key={material.id}
            active={material.id === options.materialId}
            onClick={() => onChange({ materialId: material.id })}
          >
            {material.name}
          </Chip>
        ))}
      </div>

      <Slider
        label="ارتفاع الطبقة"
        display={`${options.layerHeight.toFixed(2)} mm`}
        min={PRINT_LIMITS.layerHeight.min * 100}
        max={PRINT_LIMITS.layerHeight.max * 100}
        step={1}
        value={Math.round(options.layerHeight * 100)}
        onChange={(event) =>
          onChange({ layerHeight: Number(event.target.value) / 100 })
        }
      />

      <Slider
        label="نسبة التعبئة"
        display={`${options.infill}%`}
        min={PRINT_LIMITS.infill.min}
        max={PRINT_LIMITS.infill.max}
        step={PRINT_LIMITS.infill.step}
        value={options.infill}
        onChange={(event) => onChange({ infill: Number(event.target.value) })}
      />

      <Slider
        label="الدعامات"
        display={options.supports === 0 ? "بدون" : `${options.supports}%`}
        min={PRINT_LIMITS.supports.min}
        max={PRINT_LIMITS.supports.max}
        step={PRINT_LIMITS.supports.step}
        value={options.supports}
        onChange={(event) => onChange({ supports: Number(event.target.value) })}
      />

      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-[13px] text-soft">
          <span>اللون</span>
          <b className="text-[12.5px] text-brand">{colorName}</b>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILAMENT_COLORS.map((entry) => (
            <button
              key={entry.hex}
              type="button"
              onClick={() => onChange({ filamentColor: entry.hex })}
              aria-label={entry.name}
              aria-pressed={entry.hex === options.filamentColor}
              className={cn(
                "size-6.5 rounded-[5px] border-2 border-transparent shadow-[0_0_0_1px_var(--color-edge-2)]",
                entry.hex === options.filamentColor &&
                  "border-card shadow-[0_0_0_2px_var(--color-brand)]",
              )}
              style={{ background: entry.hex }}
            />
          ))}
        </div>
      </div>

      <Slider
        label="الكمية"
        display={String(options.quantity)}
        min={PRINT_LIMITS.quantity.min}
        max={PRINT_LIMITS.quantity.max}
        step={PRINT_LIMITS.quantity.step}
        value={options.quantity}
        onChange={(event) => onChange({ quantity: Number(event.target.value) })}
      />

      {quote.exceedsBuildVolume ? (
        <p className="rounded-[5px] border border-accent px-3 py-2 text-[12.5px] text-accent">
          مقاس القطعة أكبر من مساحة البناء — سنقسّمها لقطعتين ونجمّعها بعد الطباعة.
        </p>
      ) : null}

      <div className="rounded-card border border-brand bg-brand-soft p-4">
        <QuoteRow label="الحجم" value={`${quote.volumeCm3.toFixed(1)} cm³`} />
        <QuoteRow label="الوزن التقديري" value={`${quote.weightGrams} g`} />
        <QuoteRow label="زمن الطباعة" value={formatHours(quote.hours)} />
        <QuoteRow label="موعد التسليم" value={formatDays(quote.leadTimeDays)} arabic />

        <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-edge-2 pt-3">
          <span className="font-display text-[14.5px] font-semibold text-ink">
            السعر التقديري
          </span>
          <b className="ltr-num text-2xl text-brand">
            {quote.price} {currency}
          </b>
        </div>

        <Button className="mt-3 w-full" onClick={onOrder}>
          <WhatsappIcon className="size-4" />
          أكّد الطلب على واتساب
        </Button>
      </div>
    </aside>
  );
}
