"use client";

import dynamic from "next/dynamic";

import { useSettings, useTheme } from "@/components/providers";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

/**
 * المشهد يُحمَّل على العميل فقط وبشكل كسول،
 * فلا يدخل three.js في الـ bundle الأول ولا يعمل أثناء الـ SSR.
 */
const PrinterScene = dynamic(() => import("@/components/three/printer-scene"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-sunk" />,
});

export function PrinterStage() {
  const settings = useSettings();
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative aspect-[1/0.86] overflow-hidden rounded-card border border-edge bg-card">
      <PrinterScene
        brandColor={settings.brand.color}
        accentColor={settings.brand.accent}
        isDark={theme === "dark"}
        reduceMotion={reduceMotion}
      />

      {/* زوايا تأطير تعطي إحساس شاشة معاينة تقنية */}
      <i className="absolute top-2.5 left-2.5 size-3.5 border-2 border-r-0 border-b-0 border-brand opacity-70" />
      <i className="absolute top-2.5 right-2.5 size-3.5 border-2 border-b-0 border-l-0 border-brand opacity-70" />
      <i className="absolute right-2.5 bottom-2.5 size-3.5 border-2 border-t-0 border-l-0 border-brand opacity-70" />

      <span className="ltr-num absolute bottom-2.5 left-3 text-[9.5px] tracking-[0.14em] text-soft">
        ANYCUBIC KOBRA 3 MAX · LIVE
      </span>
    </div>
  );
}
