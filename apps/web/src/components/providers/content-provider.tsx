"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  CollectionItemMap,
  CollectionKey,
  SiteContent,
  SiteSettings,
} from "@elmagd/types";

import { createDefaultContent, createId, getContentRepository, sortByOrder } from "@/lib/data";
import { shade, withAlpha } from "@/lib/utils/color";

interface ContentContextValue {
  content: SiteContent;
  /** هل انتهى تحميل المحتوى من مصدر البيانات؟ */
  isReady: boolean;
  /** مصدر البيانات الحالي — يظهر كمؤشر في لوحة التحكم. */
  source: "local" | "supabase";

  updateSettings: (updater: (current: SiteSettings) => SiteSettings) => Promise<void>;
  saveItem: <K extends CollectionKey>(
    collection: K,
    item: CollectionItemMap[K],
  ) => Promise<void>;
  addItem: <K extends CollectionKey>(collection: K) => Promise<CollectionItemMap[K]>;
  deleteItem: (collection: CollectionKey, id: string) => Promise<void>;
  moveItem: (collection: CollectionKey, id: string, direction: -1 | 1) => Promise<void>;
  importContent: (next: SiteContent) => Promise<void>;
  resetContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

/** عنصر جديد بقيم مبدئية معقولة لكل مجموعة. */
function createBlankItem<K extends CollectionKey>(
  collection: K,
  order: number,
): CollectionItemMap[K] {
  const id = createId();
  switch (collection) {
    case "services":
      return {
        id,
        order,
        title: "خدمة جديدة",
        description: "وصف الخدمة",
        price: "from 0 EGP",
      } as CollectionItemMap[K];
    case "works":
      return {
        id,
        order,
        title: "عمل جديد",
        category: "ديكور",
        description: "وصف العمل",
        material: "PLA",
        size: "",
        printTime: "",
        image: "",
      } as CollectionItemMap[K];
    case "faq":
      return {
        id,
        order,
        question: "سؤال جديد",
        answer: "الإجابة",
      } as CollectionItemMap[K];
    default:
      return {
        id,
        order,
        name: "MATERIAL",
        tagline: "وصف الخامة",
        pricePerGram: 4,
        density: 1.24,
        strength: 50,
        heatResistance: 40,
      } as CollectionItemMap[K];
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const repository = useMemo(() => getContentRepository(), []);
  const [content, setContent] = useState<SiteContent>(() => createDefaultContent());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    repository
      .getContent()
      .then((loaded) => {
        if (!cancelled) setContent(loaded);
      })
      .catch(() => {
        // تعذّر الوصول للمصدر — نُبقي محتوى البداية حتى لا تنكسر الصفحة.
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  // ألوان الهوية تُكتب كمتغيرات CSS على <html>،
  // فيتغير الموقع كله فور تعديلها من لوحة التحكم.
  useEffect(() => {
    const { color, accent } = content.settings.brand;
    const root = document.documentElement;
    const isDark = root.dataset.theme === "dark";
    root.style.setProperty("--color-brand", color);
    root.style.setProperty("--color-brand-2", shade(color, 18));
    root.style.setProperty("--color-brand-soft", withAlpha(color, isDark ? 0.16 : 0.09));
    root.style.setProperty("--color-accent", accent);
  }, [content.settings.brand]);

  const updateSettings = useCallback<ContentContextValue["updateSettings"]>(
    async (updater) => {
      const next = updater(content.settings);
      setContent((current) => ({ ...current, settings: next }));
      await repository.saveSettings(next);
    },
    [content.settings, repository],
  );

  const saveItem = useCallback<ContentContextValue["saveItem"]>(
    async (collection, item) => {
      setContent((current) => {
        const items = [...current[collection]] as CollectionItemMap[typeof collection][];
        const index = items.findIndex((entry) => entry.id === item.id);
        if (index < 0) items.push(item);
        else items[index] = item;
        return { ...current, [collection]: items } as SiteContent;
      });
      await repository.saveItem(collection, item);
    },
    [repository],
  );

  const addItem = useCallback<ContentContextValue["addItem"]>(
    async (collection) => {
      const maxOrder = content[collection].reduce(
        (max, entry) => Math.max(max, entry.order),
        0,
      );
      const item = createBlankItem(collection, maxOrder + 1);
      await saveItem(collection, item);
      return item;
    },
    [content, saveItem],
  );

  const deleteItem = useCallback<ContentContextValue["deleteItem"]>(
    async (collection, id) => {
      setContent((current) => {
        const items = (current[collection] as Array<{ id: string }>).filter(
          (entry) => entry.id !== id,
        );
        return { ...current, [collection]: items } as SiteContent;
      });
      await repository.deleteItem(collection, id);
    },
    [repository],
  );

  const moveItem = useCallback<ContentContextValue["moveItem"]>(
    async (collection, id, direction) => {
      type Item = { id: string; order: number };
      const items = sortByOrder(content[collection] as Item[]);
      const index = items.findIndex((entry) => entry.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= items.length) return;

      // تبديل قيمتي order بين العنصرين المتجاورين.
      const reordered = items.map((entry, position) => {
        if (position === index) return { ...entry, order: items[target].order };
        if (position === target) return { ...entry, order: items[index].order };
        return entry;
      });

      setContent(
        (current) => ({ ...current, [collection]: reordered }) as SiteContent,
      );
      await repository.replaceCollection(
        collection,
        reordered as CollectionItemMap[typeof collection][],
      );
    },
    [content, repository],
  );

  const importContent = useCallback<ContentContextValue["importContent"]>(
    async (next) => {
      setContent(next);
      await repository.saveSettings(next.settings);
      await Promise.all([
        repository.replaceCollection("services", next.services),
        repository.replaceCollection("works", next.works),
        repository.replaceCollection("faq", next.faq),
        repository.replaceCollection("materials", next.materials),
      ]);
    },
    [repository],
  );

  const resetContent = useCallback<ContentContextValue["resetContent"]>(async () => {
    const defaults = await repository.reset();
    setContent(defaults);
  }, [repository]);

  const value = useMemo<ContentContextValue>(
    () => ({
      content,
      isReady,
      source: repository.name,
      updateSettings,
      saveItem,
      addItem,
      deleteItem,
      moveItem,
      importContent,
      resetContent,
    }),
    [
      content,
      isReady,
      repository.name,
      updateSettings,
      saveItem,
      addItem,
      deleteItem,
      moveItem,
      importContent,
      resetContent,
    ],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentContextValue {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent يجب أن يُستخدم داخل ContentProvider");
  return context;
}

/** اختصار للوصول للإعدادات وحدها. */
export function useSettings(): SiteSettings {
  return useContent().content.settings;
}
