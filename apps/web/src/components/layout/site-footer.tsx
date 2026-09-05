"use client";

import Link from "next/link";

import { useSettings } from "@/components/providers/content-provider";
import { Wrap } from "@/components/ui/section";
import { NAV_ORDER, PAGE_ROUTES } from "@/lib/config/site";

export function SiteFooter() {
  const settings = useSettings();
  const links = NAV_ORDER.filter((key) => settings.pages[key]);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-edge bg-card pt-11 pb-5">
      <Wrap>
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <h4 className="mb-3 text-sm">{settings.brand.name}</h4>
            <p className="max-w-[34ch] text-sm text-soft">{settings.about.text}</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm">روابط</h4>
            <ul className="space-y-2 text-sm text-soft">
              {links.map((key) => (
                <li key={key}>
                  <Link href={PAGE_ROUTES[key]} className="hover:text-ink">
                    {settings.labels[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm">تواصل</h4>
            <ul className="space-y-2 text-sm text-soft">
              <li>
                واتساب: <span className="ltr-num">{settings.contact.whatsapp}</span>
              </li>
              <li>{settings.contact.address}</li>
              <li>{settings.contact.hours}</li>
              <li>
                فيسبوك: {settings.contact.facebook} · إنستجرام: {settings.contact.instagram}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap justify-between gap-3.5 border-t border-edge pt-4.5 text-[12.5px] text-soft">
          <span>
            © {year} {settings.brand.name} — جميع الحقوق محفوظة
          </span>
          <span className="ltr-num">Anycubic Kobra 3 Max · 420×420×500</span>
        </div>
      </Wrap>
    </footer>
  );
}
