import { PAGE_KEYS, type PageKey } from "@elmagd/types";

/** ترتيب ظهور الصفحات في القائمة الرئيسية. */
export const NAV_ORDER: readonly PageKey[] = PAGE_KEYS;

/** مسار كل صفحة. */
export const PAGE_ROUTES: Record<PageKey, string> = {
  home: "/",
  services: "/services",
  work: "/work",
  viewer: "/viewer",
  materials: "/materials",
  faq: "/faq",
  contact: "/contact",
};

export const ADMIN_ROUTE = "/admin";
export const LOGIN_ROUTE = "/login";

/** تبويبات لوحة التحكم بالترتيب، مع فواصل بصرية. */
export const ADMIN_TABS = [
  { key: "orders", label: "الطلبات", href: "/admin/orders" },
  { key: "brand", label: "الهوية والألوان", href: "/admin/brand", separatorBefore: true },
  { key: "copy", label: "نصوص الموقع", href: "/admin/copy" },
  { key: "pages", label: "الصفحات والقائمة", href: "/admin/pages" },
  { key: "services", label: "الخدمات والأسعار", href: "/admin/services", separatorBefore: true },
  { key: "works", label: "معرض الأعمال", href: "/admin/works" },
  { key: "materials", label: "الخامات والتسعير", href: "/admin/materials" },
  { key: "faq", label: "الأسئلة الشائعة", href: "/admin/faq" },
  { key: "contact", label: "بيانات التواصل", href: "/admin/contact" },
  { key: "data", label: "النسخ والاستعادة", href: "/admin/data", separatorBefore: true },
] as const;

export type AdminTabKey = (typeof ADMIN_TABS)[number]["key"];

/** ألوان الفلامنت المتاحة في المعاين. */
export const FILAMENT_COLORS = [
  { hex: "#C8D2DC", name: "فضي" },
  { hex: "#0B6FB8", name: "أزرق" },
  { hex: "#E4622A", name: "برتقالي" },
  { hex: "#17A45E", name: "أخضر" },
  { hex: "#D93B57", name: "أحمر" },
  { hex: "#232A31", name: "أسود" },
] as const;

export const SITE_METADATA = {
  title: "3D Elmagd — طباعة ثلاثية الأبعاد",
  description:
    "طباعة ثلاثية الأبعاد بدقة تصنيع في مصر: ارفع ملفك، شاهده بكل الزوايا، واعرف السعر والمدة فورًا. حجم بناء حتى 42×42×50 سم.",
  locale: "ar_EG",
} as const;

/** مفتاح تخزين تفضيل الوضع الليلي في متصفح الزائر. */
export const THEME_STORAGE_KEY = "elmagd:theme";
