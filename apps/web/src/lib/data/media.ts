"use client";

import {
  MEDIA_BUCKET,
  getSupabase,
  isSupabaseEnabled,
  supabaseError,
} from "@/lib/supabase/client";
import { readImageAsDataUrl, resizeImageToFile } from "@/lib/utils/image";

export type MediaFolder = "works" | "brand";

/** لاحقة الملف من نوعه، مع الرجوع إلى jpg عند الغموض. */
function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (/^(jpg|jpeg|png|webp|gif|avif)$/.test(fromName)) return fromName;
  return file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
}

/**
 * يعيد الرابط الذي يُحفظ في المحتوى.
 *
 * مع Supabase: الصورة تُصغَّر في المتصفح ثم تُرفع إلى حاوية media ويُحفظ رابطها العام.
 * الرفع نفسه محكوم بسياسة Storage: لا يقبله الخادم إلا من جلسة المالك.
 * بدون Supabase: تعود data URL كما في وضع التصفح المحلي.
 */
export async function storeImage(
  file: File,
  folder: MediaFolder,
  maxWidth: number,
): Promise<string> {
  if (!isSupabaseEnabled()) {
    return readImageAsDataUrl(file, maxWidth);
  }

  const resized = await resizeImageToFile(file, maxWidth);
  const path = `${folder}/${crypto.randomUUID()}.${extensionFor(resized)}`;

  const storage = getSupabase().storage.from(MEDIA_BUCKET);

  const { error } = await storage.upload(path, resized, {
    cacheControl: "31536000",
    contentType: resized.type || "image/jpeg",
    upsert: false,
  });

  if (error) throw supabaseError(error, "تعذّر رفع الصورة");

  return storage.getPublicUrl(path).data.publicUrl;
}

/** حذف صورة من التخزين انطلاقًا من رابطها العام — يتجاهل الروابط الخارجية. */
export async function deleteImageByUrl(url: string): Promise<boolean> {
  if (!isSupabaseEnabled() || !url.startsWith("http")) return false;

  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index < 0) return false;

  const path = decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
  // لا نسمح بالخروج من الحاوية مهما كان الرابط المحفوظ.
  if (!/^(works|brand)\/[^/]+$/.test(path)) return false;

  const { error } = await getSupabase().storage.from(MEDIA_BUCKET).remove([path]);
  return !error;
}
