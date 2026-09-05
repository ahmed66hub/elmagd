"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
      aria-label={isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      className="grid size-9.5 place-items-center rounded-card border border-edge bg-card transition-colors duration-200 hover:border-brand hover:text-brand"
    >
      {isDark ? <SunIcon className="size-4.5" /> : <MoonIcon className="size-4.5" />}
    </button>
  );
}
