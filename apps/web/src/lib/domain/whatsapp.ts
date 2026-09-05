import type { OrderDraft, QuoteResult } from "@elmagd/types";
import { formatHours } from "@/lib/utils/format";

/**
 * لا يوجد دفع أونلاين في الموقع: كل طلب ينتهي برسالة واتساب جاهزة
 * تحمل تفاصيل القطعة والسعر التقديري، ويكمل الاتفاق يدويًا.
 */

const DEFAULT_COUNTRY_CODE = "20"; // مصر

/** تحويل الرقم المحلي (01xxxxxxxxx) إلى الصيغة الدولية التي يقبلها wa.me. */
export function normalizeWhatsappNumber(
  raw: string,
  countryCode: string = DEFAULT_COUNTRY_CODE,
): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith(countryCode) && digits.length > 10) return digits;
  if (digits.startsWith("0")) return countryCode + digits.slice(1);
  return countryCode + digits;
}

export function buildWhatsappLink(phone: string, message: string): string {
  const number = normalizeWhatsappNumber(phone);
  const text = encodeURIComponent(message.trim());
  return `https://wa.me/${number}${text ? `?text=${text}` : ""}`;
}

interface QuoteMessageOptions {
  brandName: string;
  currency: string;
  materialName?: string;
  fileName?: string;
  quantity?: number;
  layerHeight?: number;
  infill?: number;
  quote: QuoteResult;
}

/** رسالة الطلب القادمة من المعاين ثلاثي الأبعاد. */
export function buildQuoteMessage(options: QuoteMessageOptions): string {
  const { brandName, currency, quote } = options;
  const lines = [
    `السلام عليكم 👋`,
    `عايز أطلب طباعة من ${brandName}.`,
    "",
    options.fileName ? `📄 الملف: ${options.fileName}` : null,
    options.materialName ? `🧪 الخامة: ${options.materialName}` : null,
    options.quantity ? `🔢 الكمية: ${options.quantity}` : null,
    options.layerHeight ? `📐 ارتفاع الطبقة: ${options.layerHeight.toFixed(2)} mm` : null,
    typeof options.infill === "number" ? `🧱 التعبئة: ${options.infill}%` : null,
    "",
    `⚖️ الوزن التقديري: ${quote.weightGrams} g`,
    `⏱️ زمن الطباعة: ${formatHours(quote.hours)}`,
    `💰 السعر التقديري: ${quote.price} ${currency}`,
    quote.exceedsBuildVolume
      ? "⚠️ القطعة أكبر من مساحة البناء وتحتاج تقسيمًا."
      : null,
    "",
    "ممكن نأكد التفاصيل؟",
  ];

  return lines.filter((line) => line !== null).join("\n");
}

/** رسالة الطلب القادمة من نموذج التواصل. */
export function buildContactMessage(draft: OrderDraft, brandName: string): string {
  const lines = [
    `السلام عليكم 👋`,
    `طلب جديد من موقع ${brandName}.`,
    "",
    `👤 الاسم: ${draft.customerName}`,
    draft.whatsapp ? `📱 رقم التواصل: ${draft.whatsapp}` : null,
    "",
    "📝 التفاصيل:",
    draft.details,
  ];

  return lines.filter((line) => line !== null).join("\n");
}

/** رسالة عامة لزر "تواصل معنا" في الهيدر والفوتر. */
export function buildGeneralMessage(brandName: string): string {
  return `السلام عليكم 👋\nمهتم بخدمات الطباعة ثلاثية الأبعاد من ${brandName}.`;
}
