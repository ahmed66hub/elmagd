import type {
  CollectionItemMap,
  CollectionKey,
  SiteContent,
  SiteSettings,
} from "@elmagd/types";

import { createDefaultContent } from "./seed";
import { sortByOrder, type ContentRepository } from "./repository";

/**
 * تنفيذ يحفظ في localStorage — للتطوير المحلي قبل ضبط مفاتيح Supabase.
 * يُستبدل بـ SupabaseContentRepository تلقائيًا بمجرد ضبطها.
 */

const STORAGE_KEY = "elmagd:content:v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStorage(): SiteContent | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SiteContent) : null;
  } catch {
    return null;
  }
}

function writeStorage(content: SiteContent): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  } catch {
    // تجاوز حصة التخزين (صور base64 كبيرة مثلًا) — نتجاهل بصمت
    // لأن الصور ستنتقل إلى تخزين حقيقي في المرحلة القادمة.
  }
}

/** دمج المحفوظ مع القيم الافتراضية حتى لا تنكسر البيانات القديمة بعد أي تحديث. */
function mergeWithDefaults(stored: SiteContent | null): SiteContent {
  const defaults = createDefaultContent();
  if (!stored) return defaults;

  return {
    settings: {
      ...defaults.settings,
      ...stored.settings,
      brand: { ...defaults.settings.brand, ...stored.settings?.brand },
      hero: { ...defaults.settings.hero, ...stored.settings?.hero },
      about: { ...defaults.settings.about, ...stored.settings?.about },
      contact: { ...defaults.settings.contact, ...stored.settings?.contact },
      pricing: { ...defaults.settings.pricing, ...stored.settings?.pricing },
      pages: { ...defaults.settings.pages, ...stored.settings?.pages },
      labels: { ...defaults.settings.labels, ...stored.settings?.labels },
    },
    services: stored.services?.length ? stored.services : defaults.services,
    works: stored.works?.length ? stored.works : defaults.works,
    faq: stored.faq?.length ? stored.faq : defaults.faq,
    materials: stored.materials?.length ? stored.materials : defaults.materials,
  };
}

export class LocalContentRepository implements ContentRepository {
  readonly name = "local" as const;

  private cache: SiteContent | null = null;

  private load(): SiteContent {
    if (!this.cache) this.cache = mergeWithDefaults(readStorage());
    return this.cache;
  }

  private commit(next: SiteContent): void {
    this.cache = next;
    writeStorage(next);
  }

  async getContent(): Promise<SiteContent> {
    const content = this.load();
    return {
      ...content,
      services: sortByOrder(content.services),
      works: sortByOrder(content.works),
      faq: sortByOrder(content.faq),
      materials: sortByOrder(content.materials),
    };
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    this.commit({ ...this.load(), settings });
  }

  async saveItem<K extends CollectionKey>(
    collection: K,
    item: CollectionItemMap[K],
  ): Promise<void> {
    const content = this.load();
    const items = [...content[collection]] as CollectionItemMap[K][];
    const index = items.findIndex((entry) => entry.id === item.id);
    if (index < 0) items.push(item);
    else items[index] = item;

    this.commit({ ...content, [collection]: items } as SiteContent);
  }

  async deleteItem(collection: CollectionKey, id: string): Promise<void> {
    const content = this.load();
    const items = (content[collection] as Array<{ id: string }>).filter(
      (entry) => entry.id !== id,
    );
    this.commit({ ...content, [collection]: items } as SiteContent);
  }

  async replaceCollection<K extends CollectionKey>(
    collection: K,
    items: CollectionItemMap[K][],
  ): Promise<void> {
    this.commit({ ...this.load(), [collection]: items } as SiteContent);
  }

  async reset(): Promise<SiteContent> {
    const defaults = createDefaultContent();
    this.commit(defaults);
    return defaults;
  }
}
