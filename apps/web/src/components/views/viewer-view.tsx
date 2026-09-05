"use client";

import { useCallback, useMemo, useState } from "react";
import type { ModelAnalysis } from "@elmagd/types";

import { useContent, useTheme, useToast } from "@/components/providers";
import { QuotePanel, type PrintOptions } from "@/components/site/quote-panel";
import { ModelViewport } from "@/components/three/model-viewport";
import { Section, SectionLead, Wrap } from "@/components/ui/section";
import { FILAMENT_COLORS } from "@/lib/config/site";
import { submitOrder } from "@/lib/data/orders";
import { calculateQuote, PRINT_LIMITS } from "@/lib/domain/pricing";
import { InvalidStlError, isStlFile, readStlFile } from "@/lib/domain/stl";
import { buildQuoteMessage, buildWhatsappLink } from "@/lib/domain/whatsapp";

/** النموذج الافتراضي المعروض قبل رفع أي ملف — مطابق للمزهرية في المشهد. */
const SAMPLE_ANALYSIS: ModelAnalysis = {
  volumeCm3: 214,
  boundingBoxMm: [128, 128, 240],
  triangleCount: 0,
};

export function ViewerView() {
  const { content } = useContent();
  const { theme } = useTheme();
  const { notify } = useToast();

  const materials = content.materials;
  const { currency, setupFee, hourlyRate } = content.settings.pricing;

  const [positions, setPositions] = useState<Float32Array | null>(null);
  const [analysis, setAnalysis] = useState<ModelAnalysis>(SAMPLE_ANALYSIS);
  const [fileName, setFileName] = useState<string | null>(null);

  const [options, setOptions] = useState<PrintOptions>({
    materialId: materials[0]?.id ?? "",
    layerHeight: PRINT_LIMITS.layerHeight.default,
    infill: PRINT_LIMITS.infill.default,
    supports: PRINT_LIMITS.supports.default,
    quantity: PRINT_LIMITS.quantity.default,
    filamentColor: FILAMENT_COLORS[0].hex,
  });

  const material =
    materials.find((entry) => entry.id === options.materialId) ?? materials[0];

  const quote = useMemo(
    () =>
      calculateQuote({
        volumeCm3: analysis.volumeCm3,
        boundingBoxMm: analysis.boundingBoxMm,
        layerHeight: options.layerHeight,
        infill: options.infill,
        supports: options.supports,
        quantity: options.quantity,
        materialRate: material?.pricePerGram ?? 0,
        materialDensity: material?.density ?? 1.24,
        setupFee,
        hourlyRate,
      }),
    [analysis, hourlyRate, material, options, setupFee],
  );

  const handleChange = useCallback((patch: Partial<PrintOptions>) => {
    setOptions((current) => ({ ...current, ...patch }));
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!isStlFile(file.name)) {
        notify("المعاين يقرأ ملفات STL فقط حاليًا");
        return;
      }

      try {
        const { positions: parsed, analysis: parsedAnalysis } = await readStlFile(file);
        setPositions(parsed);
        setAnalysis(parsedAnalysis);
        setFileName(file.name);
        notify(`تم تحميل ${file.name}`);
      } catch (error) {
        notify(
          error instanceof InvalidStlError ? error.message : "تعذّر قراءة الملف",
        );
      }
    },
    [notify],
  );

  const handleOrder = useCallback(() => {
    const message = buildQuoteMessage({
      brandName: content.settings.brand.name,
      currency,
      materialName: material?.name,
      fileName: fileName ?? undefined,
      quantity: options.quantity,
      layerHeight: options.layerHeight,
      infill: options.infill,
      quote,
    });

    // نفتح واتساب فورًا (نقرة المستخدم) حتى لا يحجبه المتصفح،
    // ونسجّل الطلب في القاعدة بالتوازي — فشل التسجيل لا يمنع العميل من الطلب.
    const href = buildWhatsappLink(content.settings.contact.whatsapp, message);
    window.open(href, "_blank", "noopener,noreferrer");

    void submitOrder({
      customerName: "عميل من المعاين",
      whatsapp: content.settings.contact.whatsapp,
      details: message,
      fileName: fileName ?? undefined,
      materialId: material?.id,
      source: "viewer",
      print: {
        volumeCm3: analysis.volumeCm3,
        boundingBoxMm: analysis.boundingBoxMm,
        layerHeight: options.layerHeight,
        infill: options.infill,
        supports: options.supports,
        quantity: options.quantity,
      },
    }).catch(() => notify("تم فتح واتساب، لكن تعذّر تسجيل الطلب في النظام."));
  }, [analysis, content.settings, currency, fileName, material, notify, options, quote]);

  return (
    <Section>
      <Wrap>
        <SectionLead
          kicker="3D VIEWER"
          title="شوف قطعتك قبل ما تتطبع"
          text="اسحب ملف STL — يُقرأ داخل متصفحك، تدوّره بكل الزوايا، وتشوف السعر والوزن وزمن الطباعة فورًا."
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <ModelViewport
            positions={positions}
            boundingBox={analysis.boundingBoxMm}
            fileName={fileName}
            filamentColor={options.filamentColor}
            brandColor={content.settings.brand.color}
            isDark={theme === "dark"}
            onFileSelected={handleFile}
          />

          <QuotePanel
            materials={materials}
            currency={currency}
            options={options}
            quote={quote}
            onChange={handleChange}
            onOrder={handleOrder}
          />
        </div>
      </Wrap>
    </Section>
  );
}
