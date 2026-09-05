import { describe, expect, it } from "vitest";

import {
  BUILD_VOLUME,
  calculateQuote,
  estimatePrintHours,
  estimateWeight,
  exceedsBuildVolume,
} from "./pricing";

const baseInput = {
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

describe("estimateWeight", () => {
  it("يزيد الوزن مع زيادة نسبة التعبئة", () => {
    const light = estimateWeight({
      volumeCm3: 100,
      infill: 10,
      supports: 0,
      materialDensity: 1.24,
    });
    const heavy = estimateWeight({
      volumeCm3: 100,
      infill: 100,
      supports: 0,
      materialDensity: 1.24,
    });
    expect(heavy).toBeGreaterThan(light);
  });

  it("يزيد الوزن عند تفعيل الدعامات", () => {
    const without = estimateWeight({
      volumeCm3: 100,
      infill: 20,
      supports: 0,
      materialDensity: 1.24,
    });
    const withSupports = estimateWeight({
      volumeCm3: 100,
      infill: 20,
      supports: 100,
      materialDensity: 1.24,
    });
    expect(withSupports).toBeGreaterThan(without);
  });

  it("يعيد صفرًا لحجم صفري", () => {
    expect(
      estimateWeight({ volumeCm3: 0, infill: 20, supports: 0, materialDensity: 1.24 }),
    ).toBe(0);
  });
});

describe("estimatePrintHours", () => {
  it("الطبقة الأرفع تستغرق زمنًا أطول", () => {
    expect(estimatePrintHours(100, 0.1)).toBeGreaterThan(estimatePrintHours(100, 0.3));
  });

  it("يضيف زمن التسخين حتى لوزن صفري", () => {
    expect(estimatePrintHours(0, 0.2)).toBeCloseTo(0.4, 5);
  });
});

describe("exceedsBuildVolume", () => {
  it("يقبل القطعة داخل حدود الماكينة", () => {
    expect(exceedsBuildVolume([BUILD_VOLUME.x, BUILD_VOLUME.y, BUILD_VOLUME.z])).toBe(
      false,
    );
  });

  it("يرفض القطعة الأطول من ارتفاع البناء", () => {
    expect(exceedsBuildVolume([100, 100, BUILD_VOLUME.z + 1])).toBe(true);
  });
});

describe("calculateQuote", () => {
  it("لا ينزل السعر عن رسوم التجهيز", () => {
    const quote = calculateQuote({ ...baseInput, volumeCm3: 0.01 });
    expect(quote.price).toBeGreaterThanOrEqual(baseInput.setupFee);
  });

  it("يحتسب رسوم التجهيز مرة واحدة لكل طلب لا لكل قطعة", () => {
    const single = calculateQuote(baseInput);
    const ten = calculateQuote({ ...baseInput, quantity: 10 });
    // لو كانت الرسوم تتكرر لكل قطعة لكان سعر العشرة = 10 × سعر الواحدة.
    expect(ten.price).toBeLessThan(single.price * 10);
  });

  it("يضاعف الوزن والزمن مع الكمية", () => {
    const single = calculateQuote(baseInput);
    const triple = calculateQuote({ ...baseInput, quantity: 3 });
    // الوزن يُقرَّب لأقرب جرام، لذلك نسمح بفارق تقريب صغير.
    expect(Math.abs(triple.weightGrams - single.weightGrams * 3)).toBeLessThanOrEqual(2);
    expect(triple.hours).toBeCloseTo(single.hours * 3, 5);
  });

  it("يبقي مدة التسليم داخل الحدود المعلنة", () => {
    const huge = calculateQuote({ ...baseInput, volumeCm3: 5000, quantity: 30 });
    expect(huge.leadTimeDays).toBeLessThanOrEqual(12);
    expect(huge.leadTimeDays).toBeGreaterThanOrEqual(2);
  });

  it("يقرّب السعر لأقرب خمسة", () => {
    const quote = calculateQuote(baseInput);
    expect(quote.price % 5).toBe(0);
  });

  it("يرفع تنبيه تجاوز مساحة البناء", () => {
    const quote = calculateQuote({ ...baseInput, boundingBoxMm: [500, 100, 100] });
    expect(quote.exceedsBuildVolume).toBe(true);
  });
});
