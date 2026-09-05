/**
 * مسار الموقع داخل النطاق.
 *
 * على GitHub Pages بمستودع باسم المشروع يكون الموقع على
 * https://<user>.github.io/<repo>/ — أي أن كل رابط يبدأ بـ /<repo>.
 * Next يتكفّل بذلك في <Link> و<Image>، لكن الروابط التي نكتبها بأنفسنا
 * (لوجو البراند مثلًا) تحتاج هذه الدالة.
 *
 * على نطاق خاص أو مستودع <user>.github.io اتركه فارغًا.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

/** يضيف بادئة المسار للروابط الداخلية فقط، ويترك data/blob/http كما هي. */
export function assetPath(path: string): string {
  if (!path) return path;
  if (/^(https?:|data:|blob:|\/\/)/i.test(path)) return path;
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
