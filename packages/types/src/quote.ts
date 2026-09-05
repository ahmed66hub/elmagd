/** أبعاد صندوق القطعة بالمليمتر. */
export type BoundingBox = [width: number, depth: number, height: number];

/** ناتج تحليل ملف STL داخل المتصفح. */
export interface ModelAnalysis {
  /** الحجم الصافي بالسنتيمتر المكعب. */
  volumeCm3: number;
  boundingBoxMm: BoundingBox;
  triangleCount: number;
}

export interface QuoteInput {
  volumeCm3: number;
  boundingBoxMm: BoundingBox;
  /** ارتفاع الطبقة بالمليمتر (0.10 – 0.30). */
  layerHeight: number;
  /** نسبة التعبئة 10 – 100. */
  infill: number;
  /** نسبة الدعامات 0 – 100. */
  supports: number;
  quantity: number;
  /** سعر جرام الخامة المختارة. */
  materialRate: number;
  /** كثافة الخامة المختارة. */
  materialDensity: number;
  setupFee: number;
  hourlyRate: number;
}

export interface QuoteResult {
  volumeCm3: number;
  /** الوزن الكلي بالجرام لكل الكمية. */
  weightGrams: number;
  /** زمن الطباعة الكلي بالساعات. */
  hours: number;
  /** السعر الكلي مقرّبًا. */
  price: number;
  /** عدد أيام التسليم التقديرية. */
  leadTimeDays: number;
  /** هل القطعة أكبر من مساحة البناء؟ */
  exceedsBuildVolume: boolean;
}

/** حدود مساحة البناء لماكينة Anycubic Kobra 3 Max بالمليمتر. */
export interface BuildVolume {
  x: number;
  y: number;
  z: number;
}
