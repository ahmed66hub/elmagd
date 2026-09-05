import type { Metadata, Viewport } from "next";

// الخطوط مستضافة ذاتيًا داخل المشروع (لا اتصال بـ Google Fonts):
// أسرع، ويعمل بلا إنترنت، ولا يسرّب زيارات المستخدمين لطرف ثالث.
import "@fontsource-variable/alexandria";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource-variable/jetbrains-mono/wght.css";

import { AppProviders } from "@/components/providers";
import { themeInitScript } from "@/components/providers/theme-provider";
import { SITE_METADATA } from "@/lib/config/site";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: SITE_METADATA.title,
    template: `%s — 3D Elmagd`,
  },
  description: SITE_METADATA.description,
  openGraph: {
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    locale: SITE_METADATA.locale,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EFF3F7" },
    { media: "(prefers-color-scheme: dark)", color: "#08131C" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* يضبط الوضع قبل أول رسم فلا يحدث وميض عند اختيار الوضع الداكن. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
