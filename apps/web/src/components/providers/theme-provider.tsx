"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ThemeMode } from "@elmagd/types";

import { useSettings } from "@/components/providers/content-provider";
import { THEME_STORAGE_KEY } from "@/lib/config/site";
import {
  getThemeServerSnapshot,
  getThemeSnapshot,
  subscribeTheme,
  writeTheme,
} from "@/lib/theme/theme-store";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * الوضع الفعلي = اختيار الزائر إن وُجد، وإلا الوضع الافتراضي القادم من إعدادات الموقع.
 * يُكتب على <html data-theme> ليقرأه الـ CSS و مشاهد الـ 3D.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const settings = useSettings();

  const stored = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  const theme: ThemeMode = stored ?? settings.brand.theme;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => writeTheme(next), []);
  const toggleTheme = useCallback(
    () => writeTheme(theme === "dark" ? "light" : "dark"),
    [theme],
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme يجب أن يُستخدم داخل ThemeProvider");
  return context;
}

/**
 * يُحقن في <head> ليضبط الوضع قبل أول رسم للصفحة،
 * فلا يظهر وميض أبيض للزائر الذي اختار الوضع الداكن.
 */
export const themeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = stored === 'dark' || stored === 'light' ? stored : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;
