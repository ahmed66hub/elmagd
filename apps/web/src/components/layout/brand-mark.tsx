"use client";

import Link from "next/link";

import { useSettings } from "@/components/providers/content-provider";
import { assetPath } from "@/lib/config/base-path";

/** اللوجو واسم البراند — يقرأ من الإعدادات فيتغير فورًا من لوحة التحكم. */
export function BrandMark({ href = "/" }: { href?: string }) {
  const { brand } = useSettings();

  return (
    <Link href={href} className="flex items-center gap-3" aria-label={brand.name}>
      <span
        className="size-10 shrink-0 rounded-lg border border-edge-2 bg-sunk bg-cover bg-center"
        style={
          brand.logo ? { backgroundImage: `url(${assetPath(brand.logo)})` } : undefined
        }
      />
      <span>
        <b className="block font-display text-[17px] leading-tight font-bold text-ink">
          {brand.name}
        </b>
        <small className="ltr-num block text-[9.5px] tracking-[0.14em] text-soft">
          {brand.tagline}
        </small>
      </span>
    </Link>
  );
}
