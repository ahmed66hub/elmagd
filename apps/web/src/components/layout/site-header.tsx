"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandMark } from "@/components/layout/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/components/providers/auth-provider";
import { useSettings } from "@/components/providers/content-provider";
import { ButtonLink } from "@/components/ui/button";
import { CloseIcon, MenuIcon, WhatsappIcon } from "@/components/ui/icons";
import { Wrap } from "@/components/ui/section";
import { NAV_ORDER, PAGE_ROUTES } from "@/lib/config/site";
import { buildGeneralMessage, buildWhatsappLink } from "@/lib/domain/whatsapp";
import { cn } from "@/lib/utils/cn";

/**
 * زر لوحة التحكم يظهر لمتصفّح المالك وحده بعد دخوله.
 *
 * الفحص يتم في المتصفح بعد أن يؤكّد Supabase الجلسة، فتبقى الصفحات كلها
 * ملفات ثابتة واحدة للجميع، والزر لا يوجد في HTML أي صفحة تصل إلى أي زائر.
 * وهو مجرد اختصار: الوصول الفعلي للبيانات تحرسه سياسات RLS في القاعدة.
 */
export function SiteHeader() {
  const settings = useSettings();
  const { isOwner: isAdmin } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // إغلاق قائمة الموبايل عند الانتقال لصفحة أخرى — ضبط أثناء الـ render لا داخل effect.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  const links = NAV_ORDER.filter((key) => settings.pages[key]).map((key) => ({
    key,
    href: PAGE_ROUTES[key],
    label: settings.labels[key],
  }));

  const whatsappHref = buildWhatsappLink(
    settings.contact.whatsapp,
    buildGeneralMessage(settings.brand.name),
  );

  return (
    <header className="sticky top-0 z-60 border-b border-edge bg-card">
      <Wrap className="flex h-[70px] items-center gap-6">
        <BrandMark />

        <nav className="ms-auto hidden gap-0.5 lg:flex" aria-label="القائمة الرئيسية">
          {links.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.key}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-card px-4 py-2 text-[14.5px] whitespace-nowrap text-body transition-colors duration-150 hover:bg-card-2 hover:text-ink",
                  isActive && "bg-brand-soft font-medium text-brand hover:bg-brand-soft",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label="القائمة"
            className="grid size-9.5 place-items-center rounded-card border border-edge bg-card transition-colors duration-200 hover:border-brand hover:text-brand lg:hidden"
          >
            {isMenuOpen ? <CloseIcon className="size-4.5" /> : <MenuIcon className="size-4.5" />}
          </button>

          <ThemeToggle />

          <ButtonLink
            href={whatsappHref}
            external
            variant="primary"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <WhatsappIcon className="size-4" />
            تواصل واتساب
          </ButtonLink>

          {isAdmin ? (
            <ButtonLink href="/admin" variant="outline" size="sm">
              لوحة التحكم
            </ButtonLink>
          ) : null}
        </div>
      </Wrap>

      {isMenuOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-edge bg-card lg:hidden"
          aria-label="القائمة الرئيسية"
        >
          <Wrap className="flex flex-col gap-1 py-3">
            <div className="mb-1 flex justify-end">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="إغلاق القائمة"
                className="grid size-8 place-items-center rounded-card border border-edge text-soft"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
            {links.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="rounded-card px-4 py-2.5 text-[15px] text-body hover:bg-card-2 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <ButtonLink href={whatsappHref} external size="sm" className="mt-2 sm:hidden">
              <WhatsappIcon className="size-4" />
              تواصل واتساب
            </ButtonLink>
          </Wrap>
        </nav>
      ) : null}
    </header>
  );
}
