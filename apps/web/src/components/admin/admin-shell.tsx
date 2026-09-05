"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/layout/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth, useContent } from "@/components/providers";
import { Button, ButtonLink } from "@/components/ui/button";
import { Wrap } from "@/components/ui/section";
import { ADMIN_TABS, LOGIN_ROUTE } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { source, isReady } = useContent();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace(LOGIN_ROUTE);
  }

  return (
    <>
      <header className="sticky top-0 z-60 border-b border-edge bg-card">
        <Wrap className="flex h-[70px] items-center gap-4">
          <BrandMark href="/admin" />
          <div className="ms-auto flex items-center gap-2">
            <ThemeToggle />
            <ButtonLink href="/" variant="outline" size="sm">
              معاينة الموقع
            </ButtonLink>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => void handleSignOut()}
            >
              خروج
            </Button>
          </div>
        </Wrap>
      </header>

      <main className="py-8">
        <Wrap>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="ltr-num mb-2 block text-[10.5px] tracking-[0.22em] text-brand uppercase">
                CONTROL PANEL
              </span>
              <h1 className="text-[28px]">لوحة تحكم الموقع</h1>
              <div className="my-3 h-[3px] w-14 bg-brand" />
              <p className="text-soft">عدّل أي شيء هنا — التغيير يظهر في الموقع فورًا.</p>
            </div>

            <span
              className={cn(
                "ltr-num rounded border px-2 py-0.5 text-[10px] tracking-[0.1em]",
                source === "supabase" ? "border-ok text-ok" : "border-accent text-accent",
              )}
            >
              {!isReady ? "LOADING…" : source === "supabase" ? "SUPABASE · POSTGRES" : "LOCAL SAVE"}
            </span>
          </div>

          <div className="grid items-start gap-4.5 lg:grid-cols-[212px_1fr]">
            <nav className="flex flex-wrap gap-1 rounded-card border border-edge bg-card p-2 lg:sticky lg:top-[86px] lg:flex-col">
              {ADMIN_TABS.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <span key={tab.key} className="contents">
                    {"separatorBefore" in tab && tab.separatorBefore ? (
                      <span className="mx-1 hidden h-px bg-edge lg:block" />
                    ) : null}
                    <Link
                      href={tab.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "rounded-[5px] px-3 py-2.5 text-sm text-body transition-colors duration-150 hover:bg-card-2 hover:text-ink lg:w-full",
                        isActive && "bg-brand-soft font-medium text-brand",
                      )}
                    >
                      {tab.label}
                    </Link>
                  </span>
                );
              })}
            </nav>

            <div className="rounded-card border border-edge bg-card p-6">{children}</div>
          </div>
        </Wrap>
      </main>
    </>
  );
}
