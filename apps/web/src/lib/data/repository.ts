import type {
  CollectionItemMap,
  CollectionKey,
  SiteContent,
  SiteSettings,
} from "@elmagd/types";

/**
 * العقد الوحيد بين واجهة الموقع ومصدر البيانات.
 *
 * كل شيء في الـ UI يتعامل مع هذه الواجهة فقط، لذلك الانتقال من التخزين
 * المحلي إلى Postgres على Supabase لا يمس أي component:
 * يكفي تبديل التنفيذ في lib/data/index.ts.
 */
export interface ContentRepository {
  /** اسم التنفيذ الحالي — يظهر في لوحة التحكم كمؤشر للمالك. */
  readonly name: "local" | "supabase";

  getContent(): Promise<SiteContent>;

  saveSettings(settings: SiteSettings): Promise<void>;

  saveItem<K extends CollectionKey>(
    collection: K,
    item: CollectionItemMap[K],
  ): Promise<void>;

  deleteItem(collection: CollectionKey, id: string): Promise<void>;

  replaceCollection<K extends CollectionKey>(
    collection: K,
    items: CollectionItemMap[K][],
  ): Promise<void>;

  /** إعادة كل المحتوى إلى قيم البداية. */
  reset(): Promise<SiteContent>;
}

/** ترتيب أي مجموعة حسب حقل order تصاعديًا. */
export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/** توليد معرّف قصير فريد للعناصر الجديدة قبل وصولها إلى قاعدة البيانات. */
export function createId(): string {
  return `x${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
