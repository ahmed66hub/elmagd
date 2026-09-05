import type {
  FaqItem,
  Material,
  Service,
  SiteContent,
  SiteSettings,
  Work,
} from "@elmagd/types";

/**
 * محتوى البداية — ومنه يُولَّد supabase/seed.sql بأمر npm run seed:sql،
 * فلا يوجد مصدران للحقيقة، ويحرس التطابقَ اختبارُ seed-sql.test.ts.
 */

export const DEFAULT_SETTINGS: SiteSettings = {
  brand: {
    name: "3D Elmagd",
    tagline: "3D PRINTING · EGYPT",
    logo: "/brand/logo.jpg",
    theme: "light",
    color: "#0B6FB8",
    accent: "#E4622A",
  },
  hero: {
    pillText: "الماكينة تعمل الآن · 3 طلبات في الانتظار",
    title: "طباعة ثلاثية الأبعاد بدقة تصنيع",
    highlight: "وسعر تعرفه في ثانية",
    text: "ارفع ملفك، شوفه بكل الزوايا قبل الطباعة، واعرف السعر والمدة فورًا. حجم بناء يصل إلى 42×42×50 سم.",
    ctaMain: "احسب سعر قطعتك",
    ctaAlt: "شاهد الأعمال",
    stats: [
      { value: "480+", label: "قطعة تم تسليمها" },
      { value: "420×420×500", label: "حجم البناء (مم)" },
      { value: "600 mm/s", label: "أقصى سرعة" },
    ],
  },
  about: {
    title: "ماكينة واحدة تفعل ما تحتاجه ورشة",
    text: "نشتغل على Anycubic Kobra 3 Max — أكبر مساحة بناء في فئتها، طباعة متعددة الألوان بنظام ACE Pro، ودقة طبقة تصل إلى 0.1 مم.",
    specs: [
      { label: "حجم الطباعة", value: "420 × 420 × 500 mm" },
      { label: "أقصى سرعة", value: "600 mm/s" },
      { label: "طباعة متعددة الألوان", value: "ACE Pro" },
      { label: "دقة الطبقة", value: "0.1 – 0.3 mm" },
      { label: "التقنية", value: "FDM" },
    ],
  },
  contact: {
    whatsapp: "01000000000",
    phone: "01000000000",
    address: "القاهرة، مصر",
    hours: "السبت – الخميس · 10ص إلى 8م",
    facebook: "3delmagd",
    instagram: "3delmagd",
  },
  pricing: {
    setupFee: 60,
    hourlyRate: 8,
    currency: "EGP",
  },
  pages: {
    home: true,
    services: true,
    work: true,
    viewer: true,
    materials: true,
    faq: true,
    contact: true,
  },
  labels: {
    home: "الرئيسية",
    services: "الخدمات",
    work: "معرض الأعمال",
    viewer: "المعاين 3D",
    materials: "الخامات",
    faq: "أسئلة شائعة",
    contact: "تواصل",
  },
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: "s1",
    order: 1,
    title: "طباعة من ملفك",
    description:
      "ارفع STL أو OBJ أو 3MF أو STEP، نفحصه تقنيًا ونرسل السعر والمدة خلال ساعات.",
    price: "from 120 EGP",
  },
  {
    id: "s2",
    order: 2,
    title: "تصميم ونمذجة 3D",
    description: "من فكرة أو رسم يدوي أو مقاسات على ورقة إلى موديل جاهز للتصنيع.",
    price: "from 350 EGP",
  },
  {
    id: "s3",
    order: 3,
    title: "هندسة عكسية لقطع الغيار",
    description:
      "قطعة مكسورة أو مقطوعة من السوق — نقيسها، نعيد نمذجتها، ونطبع بديلًا مطابقًا.",
    price: "from 400 EGP",
  },
  {
    id: "s4",
    order: 4,
    title: "ماكيتات معمارية",
    description: "مجسمات مشاريع بمقياس رسم دقيق، وقطعة واحدة بدل التقسيم واللصق.",
    price: "from 900 EGP",
  },
  {
    id: "s5",
    order: 5,
    title: "دروع وهدايا الشركات",
    description: "مخصصة باللوجو والأسماء، بكميات، مع تشطيب وطلاء اختياري.",
    price: "from 250 EGP",
  },
  {
    id: "s6",
    order: 6,
    title: "قطع Cosplay بمقاس حقيقي",
    description: "خوذات وأقنعة ودروع — التخصص الذي يناسب حجم ماكينتنا تحديدًا.",
    price: "from 1200 EGP",
  },
];

export const DEFAULT_WORKS: Work[] = [
  {
    id: "w1",
    order: 1,
    title: "ماكيت مشروع سكني",
    category: "ماكيتات",
    description: "مقياس 1:100، قطعة واحدة بدون تقسيم.",
    material: "PLA",
    size: "40 cm",
    printTime: "26 h",
    image: "",
  },
  {
    id: "w2",
    order: 2,
    title: "هيكل درون",
    category: "وظيفي",
    description: "خامة ألياف كربون، محسّن للمتانة وخفة الوزن.",
    material: "PLA-CF",
    size: "22 cm",
    printTime: "9 h",
    image: "",
  },
  {
    id: "w3",
    order: 3,
    title: "تروس صناعية",
    category: "وظيفي",
    description: "قطع غيار بتفاوت أبعاد ±0.2 مم بعد المعايرة.",
    material: "PETG",
    size: "9 cm",
    printTime: "3 h",
    image: "",
  },
  {
    id: "w4",
    order: 4,
    title: "خوذة Cosplay",
    category: "ديكور",
    description: "بمقاس حقيقي من قطعة واحدة مع تشطيب اختياري.",
    material: "PLA-CF",
    size: "42 cm",
    printTime: "38 h",
    image: "",
  },
  {
    id: "w5",
    order: 5,
    title: "درع تكريم بلوجو",
    category: "هدايا",
    description: "مخصص بالاسم والشعار، متاح بكميات.",
    material: "PLA + طلاء",
    size: "22 cm",
    printTime: "8 h",
    image: "",
  },
  {
    id: "w6",
    order: 6,
    title: "مزهرية حلزونية",
    category: "ديكور",
    description: "طباعة حلزونية بلمعان حريري بدون طلاء.",
    material: "PLA SILK",
    size: "28 cm",
    printTime: "14 h",
    image: "",
  },
];

export const DEFAULT_FAQ: FaqItem[] = [
  {
    id: "f1",
    order: 1,
    question: "كم يستغرق تنفيذ الطلب؟",
    answer:
      "القطع الصغيرة من يوم إلى يومين، والمتوسطة 3–5 أيام. القطع الكبيرة والكميات نحدد لها موعدًا دقيقًا قبل التأكيد.",
  },
  {
    id: "f2",
    order: 2,
    question: "كيف يُحسب السعر بالضبط؟",
    answer:
      "وزن الخامة المستهلكة + زمن تشغيل الماكينة + التشطيب اليدوي إن وُجد. المعاين يعطيك تقديرًا فوريًا والسعر النهائي بعد مراجعة الملف.",
  },
  {
    id: "f3",
    order: 3,
    question: "ما عندي ملف ثلاثي الأبعاد — تقدروا تساعدوني؟",
    answer:
      "نعم، أرسل صورة أو رسمًا ومقاسات تقريبية وننفذ التصميم من الصفر، ويبقى الملف ملكك بعد التسليم.",
  },
  {
    id: "f4",
    order: 4,
    question: "هل القطعة تتحمل الاستخدام الحقيقي؟",
    answer:
      "يعتمد على الخامة. PETG وABS للقطع الوظيفية، وPLA أنسب للديكور والمجسمات.",
  },
  {
    id: "f5",
    order: 5,
    question: "ماذا عن سرية التصميم الذي أرسله؟",
    answer:
      "ملفك ملكك وحدك، لا يُعاد استخدامه ولا يُنشر في المعرض إلا بموافقة كتابية منك.",
  },
];

export const DEFAULT_MATERIALS: Material[] = [
  {
    id: "m1",
    order: 1,
    name: "PLA",
    tagline: "ديكور، ماكيتات، هدايا بتفاصيل دقيقة",
    pricePerGram: 3.5,
    density: 1.24,
    strength: 55,
    heatResistance: 25,
  },
  {
    id: "m2",
    order: 2,
    name: "PETG",
    tagline: "قطع وظيفية وحوامل وحاويات",
    pricePerGram: 4.5,
    density: 1.27,
    strength: 80,
    heatResistance: 55,
  },
  {
    id: "m3",
    order: 3,
    name: "ABS",
    tagline: "قطع تتعرض للشمس والحرارة",
    pricePerGram: 5.5,
    density: 1.04,
    strength: 85,
    heatResistance: 88,
  },
  {
    id: "m4",
    order: 4,
    name: "TPU",
    tagline: "قطع مرنة وجلود وحشوات",
    pricePerGram: 7.5,
    density: 1.21,
    strength: 60,
    heatResistance: 45,
  },
  {
    id: "m5",
    order: 5,
    name: "PLA-CF",
    tagline: "ألياف كربون، صلابة وتشطيب مطفي",
    pricePerGram: 6.5,
    density: 1.22,
    strength: 88,
    heatResistance: 60,
  },
];

export function createDefaultContent(): SiteContent {
  return structuredClone({
    settings: DEFAULT_SETTINGS,
    services: DEFAULT_SERVICES,
    works: DEFAULT_WORKS,
    faq: DEFAULT_FAQ,
    materials: DEFAULT_MATERIALS,
  });
}
