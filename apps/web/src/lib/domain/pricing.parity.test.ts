import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { PRICING_MODEL, calculateQuote } from "./pricing";

/**
 * تطابق نموذج التسعير بين الواجهة والقاعدة.
 *
 * في هذه النسخة لا يوجد سيرفر: المتصفح يعرض السعر، لكن الذي يُخزَّن مع الطلب
 * هو ما تحسبه دالة calculate_quote داخل Postgres (supabase/schema.sql).
 * لو انفصل الملفان، يرى العميل سعرًا ويُسجَّل عنده سعر آخر — لذلك:
 *
 *  1) نتأكد أن كل ثابت في النموذج مكتوب بنفس القيمة داخل ملف SQL.
 *  2) نتأكد أن المدخل المرجعي يعطي نفس المخرج المُتحقَّق منه على Postgres فعليًا.
 */

const SCHEMA_SQL = readFileSync(
  resolve(process.cwd(), "..", "..", "supabase", "schema.sql"),
  "utf8",
);

/** يقرأ قيمة ثابت معرّف داخل الدالة، مثل: shell_factor constant ... := 0.26; */
function sqlConstant(name: string): number {
  const match = SCHEMA_SQL.match(
    new RegExp(`${name}\\s+constant[^:]*:=\\s*(-?[0-9.]+)\\s*;`),
  );
  if (!match) throw new Error(`لم يُعثر على الثابت ${name} في supabase/schema.sql`);
  return Number(match[1]);
}

const REFERENCE_INPUT = {
  volumeCm3: 100,
  boundingBoxMm: [100, 100, 100] as [number, number, number],
  layerHeight: 0.2,
  infill: 20,
  supports: 0,
  quantity: 1,
  materialRate: 3.5,
  materialDensity: 1.24,
  setupFee: 60,
  hourlyRate: 8,
};

describe("تطابق التسعير مع calculate_quote في Postgres", () => {
  it("كل ثوابت النموذج مكتوبة بنفس القيم في ملف SQL", () => {
    expect(sqlConstant("shell_factor")).toBe(PRICING_MODEL.shellFactor);
    expect(sqlConstant("infill_factor")).toBe(PRICING_MODEL.infillFactor);
    expect(sqlConstant("support_divisor")).toBe(PRICING_MODEL.supportDivisor);
    expect(sqlConstant("grams_per_hour")).toBe(PRICING_MODEL.gramsPerHour);
    expect(sqlConstant("reference_layer")).toBe(PRICING_MODEL.referenceLayerHeight);
    expect(sqlConstant("warmup_hours")).toBe(PRICING_MODEL.warmupHours);
    expect(sqlConstant("rounding_step")).toBe(PRICING_MODEL.roundingStep);
    expect(sqlConstant("hours_per_day")).toBe(PRICING_MODEL.hoursPerDay);
    expect(sqlConstant("min_lead_days")).toBe(PRICING_MODEL.minLeadDays);
    expect(sqlConstant("max_lead_days")).toBe(PRICING_MODEL.maxLeadDays);
  });

  it("حدود مساحة البناء نفسها في ملف SQL", () => {
    expect(SCHEMA_SQL).toContain("box[1], 0) > 420");
    expect(SCHEMA_SQL).toContain("box[2], 0) > 420");
    expect(SCHEMA_SQL).toContain("box[3], 0) > 500");
  });

  // القيم أدناه مأخوذة من تشغيل calculate_quote على PostgreSQL فعليًا
  // بنفس هذه المدخلات — راجع supabase/tests/rls-test.sql.
  it("يعطي نفس النتيجة للمدخل المرجعي", () => {
    const quote = calculateQuote(REFERENCE_INPUT);

    expect(quote.weightGrams).toBe(51);
    expect(Number(quote.hours.toFixed(3))).toBe(3.376);
    expect(quote.price).toBe(265);
    expect(quote.leadTimeDays).toBe(2);
  });

  it("يعطي نفس النتيجة لكمية 10", () => {
    const quote = calculateQuote({ ...REFERENCE_INPUT, quantity: 10 });

    expect(quote.weightGrams).toBe(506);
    expect(Number(quote.hours.toFixed(2))).toBe(33.76);
    expect(quote.price).toBe(2100);
    expect(quote.leadTimeDays).toBe(4);
  });

  it("يعطي نفس النتيجة لقطعة ضخمة بكمية كبيرة", () => {
    const quote = calculateQuote({
      ...REFERENCE_INPUT,
      volumeCm3: 5000,
      quantity: 30,
    });

    expect(quote.leadTimeDays).toBe(12);
    expect(quote.price % 5).toBe(0);
  });
});
