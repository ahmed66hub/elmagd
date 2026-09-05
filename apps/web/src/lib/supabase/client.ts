"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * عميل Supabase الوحيد في المشروع.
 *
 * لماذا المفتاح ظاهر في المتصفح؟
 * لأنه anon/publishable key، وهذا تصميمه: مفتاح عام يقول «أنا زائر».
 * الصلاحيات لا تأتي منه بل من Row Level Security داخل Postgres — راجع
 * supabase/schema.sql. الزائر يقرأ المحتوى فقط، والكتابة كلها محصورة في
 * بريد المالك، ويرفضها الخادم حتى لو عدّل أحدهم كود الصفحة في متصفحه.
 *
 * لا تضع مفتاح service_role هنا إطلاقًا — هذا المفتاح يتجاوز كل السياسات.
 */

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** بريد المالك — يُستخدم في الواجهة للعرض فقط؛ الحماية الفعلية في القاعدة. */
export const OWNER_EMAIL = (
  process.env.NEXT_PUBLIC_OWNER_EMAIL ?? "masry5357@gmail.com"
).toLowerCase();

/** اسم حاوية الصور في Supabase Storage. */
export const MEDIA_BUCKET = "media";

/**
 * هل ضُبطت بيانات Supabase؟
 * عند تركها فارغة يعمل الموقع بمحتوى البداية من المتصفح،
 * فلا ينكسر شيء قبل إنشاء المشروع على Supabase.
 */
export function isSupabaseEnabled(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}

let client: SupabaseClient | null = null;

/** يُنشأ عند أول استخدام فقط — حتى لا يُلمس تخزين المتصفح أثناء بناء الصفحات. */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseEnabled()) {
    throw new Error(
      "بيانات Supabase غير مضبوطة — أضِف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  client ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // الموقع static على GitHub Pages، فالعودة من Google تصل في الرابط.
      detectSessionInUrl: true,
      flowType: "pkce",
      storageKey: "elmagd-auth",
    },
  });

  return client;
}

/** رسالة خطأ عربية موحّدة من أي خطأ يعود من Supabase. */
export function supabaseError(error: { message: string } | null, fallback: string): Error {
  return new Error(error?.message ? `${fallback}: ${error.message}` : fallback);
}
