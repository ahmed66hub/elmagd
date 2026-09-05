import type { ThemeMode } from "@elmagd/types";

import { THEME_STORAGE_KEY } from "@/lib/config/site";

/**
 * تفضيل الوضع الليلي يعيش في localStorage — وهو نظام خارجي عن React،
 * لذلك نقرأه عبر useSyncExternalStore بدل setState داخل useEffect.
 *
 * القيمة null تعني: الزائر لم يختر شيئًا بعد، فيُستخدم الوضع الافتراضي من الإعدادات.
 */

type StoredTheme = ThemeMode | null;

let cache: StoredTheme = null;
let hydrated = false;
const listeners = new Set<() => void>();

function readStorage(): StoredTheme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
}

function refresh(): void {
  cache = readStorage();
  hydrated = true;
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: () => void): () => void {
  if (!hydrated) refresh();
  listeners.add(listener);

  // تبويب آخر غيّر الوضع؟ نتابعه هنا.
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      refresh();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getThemeSnapshot(): StoredTheme {
  if (!hydrated) refresh();
  return cache;
}

/** أثناء الـ SSR لا يوجد تفضيل محفوظ. */
export function getThemeServerSnapshot(): StoredTheme {
  return null;
}

export function writeTheme(next: ThemeMode): void {
  cache = next;
  hydrated = true;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // التصفح الخاص قد يمنع الكتابة — الاختيار يظل فعالًا لهذه الجلسة.
  }
  emit();
}
