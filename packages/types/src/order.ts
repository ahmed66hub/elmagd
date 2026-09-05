import type { BoundingBox, QuoteResult } from "./quote";

/**
 * الطلب لا يمر بأي دفع أونلاين:
 * يُسجَّل في Postgres على Supabase، ثم تفتح الواجهة محادثة واتساب جاهزة.
 */

export type OrderSource = "viewer" | "contact";

export type OrderStatus =
  | "new"
  | "quoted"
  | "confirmed"
  | "printing"
  | "ready"
  | "delivered"
  | "cancelled";

/** إعدادات الطباعة التي يرسلها المعاين ليعيد الخادم حساب السعر منها. */
export interface PrintOptionsPayload {
  volumeCm3: number;
  boundingBoxMm: BoundingBox;
  layerHeight: number;
  infill: number;
  supports: number;
  quantity: number;
}

/** ما ترسله الواجهة عند الطلب. لاحظ: لا يوجد سعر — الخادم هو من يحسبه. */
export interface OrderDraft {
  customerName: string;
  whatsapp: string;
  details: string;
  /** اسم الملف المرفوع إن وُجد (الملف نفسه لا يغادر متصفح العميل). */
  fileName?: string;
  materialId?: string;
  source?: OrderSource;
  print?: PrintOptionsPayload;
  /** معرّف العميل المسجّل إن وُجد — الحساب اختياري تمامًا. */
  customerId?: string | null;
}

/** عرض السعر كما حسبه الخادم وخزّنه مع الطلب. */
export interface StoredQuote extends QuoteResult {
  currency: string;
  materialId: string;
  materialName: string;
  layerHeight: number;
  infill: number;
  supports: number;
  quantity: number;
}

/** الطلب كما يعود من الـ API. */
export interface Order {
  id: string;
  customerName: string;
  whatsapp: string;
  details: string;
  fileName: string | null;
  materialName: string | null;
  quote: StoredQuote | null;
  status: OrderStatus;
  source: OrderSource;
  customerId: string | null;
  createdAt: string | null;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "جديد",
  quoted: "أُرسل السعر",
  confirmed: "مؤكَّد",
  printing: "قيد الطباعة",
  ready: "جاهز للتسليم",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};
