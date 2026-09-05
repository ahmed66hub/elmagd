import type { NextConfig } from "next";

/**
 * إعدادات البناء لنسخة GitHub Pages.
 *
 * output: "export" يحوّل الموقع كله إلى ملفات HTML وCSS وJS ثابتة،
 * لأن GitHub Pages لا يشغّل سيرفرًا. لهذا لا توجد في هذه النسخة
 * Server Actions ولا proxy.ts ولا أي قراءة للكوكيز على الخادم —
 * ومكانها كله انتقل إلى Supabase: القاعدة والتخزين والدخول.
 */

// على مستودع باسم المشروع يصبح الموقع تحت /<repo>.
// يضبطه ملف النشر تلقائيًا؛ ويبقى فارغًا على نطاق خاص أو مستودع <user>.github.io.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "export",

  // يولّد services/index.html بدل services.html — أكثر أمانًا مع GitHub Pages.
  trailingSlash: true,

  ...(basePath ? { basePath, assetPrefix: basePath } : {}),

  // packages/types يُكتب بـ TypeScript خام، فيحتاج المرور على الـ compiler.
  transpilePackages: ["@elmagd/types"],

  // الجذر للـ monorepo حتى لا يخلط Turbopack بين lockfiles.
  outputFileTracingRoot: process.cwd().replace(/[\\/]apps[\\/]web$/, ""),

  images: {
    // لا يوجد سيرفر يحسّن الصور في البناء الثابت.
    unoptimized: true,
  },
};

export default nextConfig;
