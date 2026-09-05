import type {
  CollectionItemMap,
  CollectionKey,
  SiteContent,
  SiteSettings,
} from "@elmagd/types";

import { getSupabase, supabaseError } from "@/lib/supabase/client";
import {
  TABLE_NAMES,
  toFaqItem,
  toMaterial,
  toRow,
  toService,
  toWork,
  type FaqRow,
  type MaterialRow,
  type ServiceRow,
  type WorkRow,
} from "@/lib/supabase/mappers";

import { createDefaultContent } from "./seed";
import { sortByOrder, type ContentRepository } from "./repository";

/**
 * مصدر البيانات الحقيقي في هذه النسخة: Postgres على Supabase مباشرة.
 *
 * لا يوجد سيرفر وسيط، لذلك الحماية ليست في هذا الملف بل في القاعدة:
 * كل استدعاء كتابة هنا يمر على سياسات RLS، وترفضه Postgres إن لم يكن
 * التوكن المرفق توكن المالك. أي شخص يستطيع استدعاء هذه الدوال من كونسول
 * المتصفح — ولن يحدث شيء.
 */

/** مفاتيح جدول settings ككائن واحد. */
const SETTINGS_KEYS = [
  "brand",
  "hero",
  "about",
  "contact",
  "pricing",
  "pages",
  "labels",
] as const;

type SettingsKey = (typeof SETTINGS_KEYS)[number];

interface SettingRow {
  key: string;
  value: unknown;
}

/**
 * دمج ما في القاعدة مع القيم الافتراضية.
 * أي مفتاح ناقص (قاعدة جديدة، أو حقل أُضيف بعد الزرع) لا يكسر الصفحة.
 */
function mergeSettings(rows: SettingRow[]): SiteSettings {
  const defaults = createDefaultContent().settings;
  const stored = new Map(rows.map((row) => [row.key, row.value]));

  const pick = <K extends SettingsKey>(key: K): SiteSettings[K] => ({
    ...defaults[key],
    ...((stored.get(key) as Partial<SiteSettings[K]> | undefined) ?? {}),
  });

  return {
    brand: pick("brand"),
    hero: pick("hero"),
    about: pick("about"),
    contact: pick("contact"),
    pricing: pick("pricing"),
    pages: pick("pages"),
    labels: pick("labels"),
  };
}

export class SupabaseContentRepository implements ContentRepository {
  readonly name = "supabase" as const;

  async getContent(): Promise<SiteContent> {
    const supabase = getSupabase();

    const [settings, services, works, faq, materials] = await Promise.all([
      supabase.from("settings").select("key, value"),
      supabase.from("services").select("*").order("position").order("id"),
      supabase.from("works").select("*").order("position").order("id"),
      supabase.from("faq_items").select("*").order("position").order("id"),
      supabase.from("materials").select("*").order("position").order("id"),
    ]);

    const failure =
      settings.error ?? services.error ?? works.error ?? faq.error ?? materials.error;
    if (failure) throw supabaseError(failure, "تعذّر تحميل المحتوى");

    return {
      settings: mergeSettings((settings.data ?? []) as SettingRow[]),
      services: ((services.data ?? []) as ServiceRow[]).map(toService),
      works: ((works.data ?? []) as WorkRow[]).map(toWork),
      faq: ((faq.data ?? []) as FaqRow[]).map(toFaqItem),
      materials: ((materials.data ?? []) as MaterialRow[]).map(toMaterial),
    };
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    const { error } = await getSupabase()
      .from("settings")
      .upsert(
        SETTINGS_KEYS.map((key) => ({
          key,
          value: settings[key],
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "key" },
      );

    if (error) throw supabaseError(error, "تعذّر حفظ الإعدادات");
  }

  async saveItem<K extends CollectionKey>(
    collection: K,
    item: CollectionItemMap[K],
  ): Promise<void> {
    const { error } = await getSupabase()
      .from(TABLE_NAMES[collection])
      .upsert(toRow(collection, item), { onConflict: "id" });

    if (error) throw supabaseError(error, "تعذّر حفظ العنصر");
  }

  async deleteItem(collection: CollectionKey, id: string): Promise<void> {
    const { error } = await getSupabase()
      .from(TABLE_NAMES[collection])
      .delete()
      .eq("id", id);

    if (error) throw supabaseError(error, "تعذّر حذف العنصر");
  }

  async replaceCollection<K extends CollectionKey>(
    collection: K,
    items: CollectionItemMap[K][],
  ): Promise<void> {
    const supabase = getSupabase();
    const table = TABLE_NAMES[collection];

    if (items.length > 0) {
      const { error } = await supabase
        .from(table)
        .upsert(
          items.map((item) => toRow(collection, item)),
          { onConflict: "id" },
        );
      if (error) throw supabaseError(error, "تعذّر حفظ الترتيب");
    }

    // حذف ما لم يعد ضمن القائمة — حتى تعكس القاعدة القائمة كما هي تمامًا.
    const keptIds = items.map((item) => item.id);
    const remove = supabase.from(table).delete();
    const { error: deleteError } = await (keptIds.length > 0
      ? remove.not("id", "in", `(${keptIds.map((id) => `"${id}"`).join(",")})`)
      : remove.neq("id", "__none__"));

    if (deleteError) throw supabaseError(deleteError, "تعذّر تحديث القائمة");
  }

  async reset(): Promise<SiteContent> {
    const defaults = createDefaultContent();

    await this.saveSettings(defaults.settings);
    await Promise.all([
      this.replaceCollection("services", defaults.services),
      this.replaceCollection("works", defaults.works),
      this.replaceCollection("faq", defaults.faq),
      this.replaceCollection("materials", defaults.materials),
    ]);

    return {
      ...defaults,
      services: sortByOrder(defaults.services),
      works: sortByOrder(defaults.works),
      faq: sortByOrder(defaults.faq),
      materials: sortByOrder(defaults.materials),
    };
  }
}
