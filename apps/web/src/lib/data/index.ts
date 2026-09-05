import { LocalContentRepository } from "./local-repository";
import type { ContentRepository } from "./repository";
import { SupabaseContentRepository } from "./supabase-repository";
import { isSupabaseEnabled } from "@/lib/supabase/client";

/**
 * نقطة التبديل الوحيدة بين مصادر البيانات.
 *
 * بضبط مفاتيح Supabase ينتقل الموقع كله من التخزين المحلي في المتصفح
 * إلى Postgres على Supabase بدون تعديل أي component.
 */

let instance: ContentRepository | null = null;

export function getContentRepository(): ContentRepository {
  if (instance) return instance;

  instance = isSupabaseEnabled()
    ? new SupabaseContentRepository()
    : new LocalContentRepository();

  return instance;
}

export * from "./repository";
export * from "./seed";
