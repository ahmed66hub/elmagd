import type { BuildVolume, QuoteInput, QuoteResult } from "@elmagd/types";

/**
 * مساحة البناء الفعلية لماكينة Anycubic Kobra 3 Max.
 * أي قطعة تتجاوز هذه الأبعاد تحتاج تقسيمًا وتجميعًا بعد الطباعة.
 */
export const BUILD_VOLUME: BuildVolume = { x: 420, y: 420, z: 500 };

/** حدود إعدادات الطباعة المسموح بها في المعاين. */
export const PRINT_LIMITS = {
  layerHeight: { min: 0.1, max: 0.3, step: 0.01, default: 0.2 },
  infill: { min: 10, max: 100, step: 5, default: 20 },
  supports: { min: 0, max: 100, step: 10, default: 0 },
  quantity: { min: 1, max: 30, step: 1, default: 1 },
} as const;

/**
 * معاملات نموذج التسعير — مجمّعة هنا لأن ضبطها تجاري وليس برمجيًا.
 * لاحقًا تنتقل هذه القيم إلى جدول settings في Postgres ليعدّلها المالك من لوحة التحكم.
 */
export const PRICING_MODEL = {
  /** نسبة المادة الصلبة عند تعبئة 0% (الجدران والأسطح). */
  shellFactor: 0.26,
  /** الزيادة في نسبة المادة لكل 1% تعبئة. */
  infillFactor: 0.0074,
  /** مقام تأثير الدعامات على استهلاك الخامة. */
  supportDivisor: 260,
  /** معدل الترسيب بالجرام في الساعة عند طبقة 0.20 مم. */
  gramsPerHour: 17,
  /** ارتفاع الطبقة المرجعي الذي عايرنا عليه معدل الترسيب. */
  referenceLayerHeight: 0.2,
  /** زمن ثابت للتسخين والمعايرة قبل كل طباعة (ساعة). */
  warmupHours: 0.4,
  /** تقريب السعر النهائي لأقرب مضاعف. */
  roundingStep: 5,
  /** أقصى ساعات تشغيل يمكن جدولتها في اليوم الواحد. */
  hoursPerDay: 12,
  /** أقصى عدد أيام تسليم معلن. */
  maxLeadDays: 12,
  /** أقل عدد أيام تسليم معلن. */
  minLeadDays: 2,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** وزن القطعة الواحدة بالجرام. */
export function estimateWeight(input: {
  volumeCm3: number;
  infill: number;
  supports: number;
  materialDensity: number;
}): number {
  const { shellFactor, infillFactor, supportDivisor } = PRICING_MODEL;
  const solidRatio = shellFactor + infillFactor * input.infill;
  const supportRatio = 1 + input.supports / supportDivisor;
  return Math.max(0, input.volumeCm3 * input.materialDensity * solidRatio * supportRatio);
}

/** زمن طباعة القطعة الواحدة بالساعات. */
export function estimatePrintHours(weightGrams: number, layerHeight: number): number {
  const { gramsPerHour, referenceLayerHeight, warmupHours } = PRICING_MODEL;
  const safeLayerHeight = layerHeight > 0 ? layerHeight : referenceLayerHeight;
  return (weightGrams / gramsPerHour) * (referenceLayerHeight / safeLayerHeight) + warmupHours;
}

/** هل القطعة أكبر من مساحة البناء؟ */
export function exceedsBuildVolume(box: readonly [number, number, number]): boolean {
  const [width, depth, height] = box;
  return width > BUILD_VOLUME.x || depth > BUILD_VOLUME.y || height > BUILD_VOLUME.z;
}

/**
 * حساب عرض السعر الكامل.
 *
 * ملاحظة على الفرق عن نموذج التصميم الأولي: رسوم التجهيز تُحتسب مرة واحدة
 * لكل طلب (كما يقول اسمها في لوحة التحكم) وليس لكل قطعة، لذلك الكميات الكبيرة
 * تعطي سعر وحدة أقل — وهو السلوك الذي يتوقعه العميل.
 */
export function calculateQuote(input: QuoteInput): QuoteResult {
  const quantity = Math.max(1, Math.round(input.quantity));

  const unitWeight = estimateWeight({
    volumeCm3: input.volumeCm3,
    infill: input.infill,
    supports: input.supports,
    materialDensity: input.materialDensity,
  });
  const unitHours = estimatePrintHours(unitWeight, input.layerHeight);

  const materialCost = unitWeight * input.materialRate * quantity;
  const machineCost = unitHours * input.hourlyRate * quantity;
  const raw = input.setupFee + materialCost + machineCost;

  const { roundingStep, hoursPerDay, maxLeadDays, minLeadDays } = PRICING_MODEL;
  const price = Math.max(input.setupFee, Math.round(raw / roundingStep) * roundingStep);

  const totalHours = unitHours * quantity;
  const leadTimeDays = clamp(
    Math.ceil(totalHours / hoursPerDay) + 1,
    minLeadDays,
    maxLeadDays,
  );

  return {
    volumeCm3: input.volumeCm3,
    weightGrams: Math.round(unitWeight * quantity),
    hours: totalHours,
    price,
    leadTimeDays,
    exceedsBuildVolume: exceedsBuildVolume(input.boundingBoxMm),
  };
}
