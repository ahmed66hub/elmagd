/** مفاتيح صفحات الموقع العام — تُستخدم للقائمة وللإظهار/الإخفاء من لوحة التحكم. */
export const PAGE_KEYS = [
  "home",
  "services",
  "work",
  "viewer",
  "materials",
  "faq",
  "contact",
] as const;

export type PageKey = (typeof PAGE_KEYS)[number];

/** كل عنصر محتوى له معرّف وترتيب يدوي داخل قائمته. */
export interface OrderedEntity {
  id: string;
  /** ترتيب العرض (تصاعدي). */
  order: number;
}

export interface Service extends OrderedEntity {
  title: string;
  description: string;
  /** نص السعر كما يظهر للعميل، مثل: "from 120 EGP". */
  price: string;
}

export interface Work extends OrderedEntity {
  title: string;
  category: string;
  description: string;
  /** الخامة المستخدمة، مثل: PLA / PETG. */
  material: string;
  /** أكبر مقاس للقطعة كنص، مثل: "40 cm". */
  size: string;
  /** زمن الطباعة كنص، مثل: "26 h". */
  printTime: string;
  /** رابط الصورة أو data URL في المرحلة الحالية. */
  image: string;
}

export interface FaqItem extends OrderedEntity {
  question: string;
  answer: string;
}

export interface Material extends OrderedEntity {
  name: string;
  /** وصف قصير لاستخدام الخامة. */
  tagline: string;
  /** سعر الجرام بالعملة المحددة في الإعدادات. */
  pricePerGram: number;
  /** الكثافة g/cm³ — تدخل في حساب الوزن. */
  density: number;
  /** المتانة كنسبة مئوية للعرض فقط. */
  strength: number;
  /** مقاومة الحرارة كنسبة مئوية للعرض فقط. */
  heatResistance: number;
}

export type ThemeMode = "light" | "dark";

export interface BrandSettings {
  name: string;
  tagline: string;
  /** رابط اللوجو أو data URL. */
  logo: string;
  theme: ThemeMode;
  /** اللون الأساسي hex. */
  color: string;
  /** لون التمييز hex. */
  accent: string;
}

export interface HeroSettings {
  pillText: string;
  title: string;
  highlight: string;
  text: string;
  ctaMain: string;
  ctaAlt: string;
  stats: Array<{ value: string; label: string }>;
}

export interface AboutSettings {
  title: string;
  text: string;
  /** مواصفات الماكينة كصفوف label/value. */
  specs: Array<{ label: string; value: string }>;
}

export interface ContactSettings {
  /** رقم الواتساب بصيغة دولية بدون + مثل 201000000000 — يُستخدم في روابط wa.me. */
  whatsapp: string;
  phone: string;
  address: string;
  hours: string;
  facebook: string;
  instagram: string;
}

export interface PricingSettings {
  /** رسوم تجهيز ثابتة لكل طلب. */
  setupFee: number;
  /** سعر ساعة تشغيل الماكينة. */
  hourlyRate: number;
  currency: string;
}

export interface SiteSettings {
  brand: BrandSettings;
  hero: HeroSettings;
  about: AboutSettings;
  contact: ContactSettings;
  pricing: PricingSettings;
  /** إظهار/إخفاء كل صفحة من القائمة. */
  pages: Record<PageKey, boolean>;
  /** اسم كل صفحة في القائمة. */
  labels: Record<PageKey, string>;
}

/** كامل محتوى الموقع كما يعود من الـ API أو من التخزين المحلي. */
export interface SiteContent {
  settings: SiteSettings;
  services: Service[];
  works: Work[];
  faq: FaqItem[];
  materials: Material[];
}

/** أسماء المجموعات القابلة للتحرير من لوحة التحكم. */
export type CollectionKey = "services" | "works" | "faq" | "materials";

export type CollectionItemMap = {
  services: Service;
  works: Work;
  faq: FaqItem;
  materials: Material;
};
