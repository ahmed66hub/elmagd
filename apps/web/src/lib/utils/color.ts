/** أدوات ألوان خالصة تُستخدم لاشتقاق درجات الهوية من لون واحد يختاره المالك. */

function normalizeHex(hex: string): string {
  const value = hex.replace("#", "").trim();
  if (value.length === 3) {
    return value
      .split("")
      .map((char) => char + char)
      .join("");
  }
  return value.padEnd(6, "0").slice(0, 6);
}

export function hexToRgb(hex: string): [number, number, number] {
  const value = normalizeHex(hex);
  const int = Number.parseInt(value, 16);
  if (Number.isNaN(int)) return [0, 0, 0];
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/** تفتيح (قيمة موجبة) أو تغميق (قيمة سالبة) لون hex. */
export function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${toHex(r + amount)}${toHex(g + amount)}${toHex(b + amount)}`;
}

/** تحويل hex إلى rgb() بشفافية — تُستخدم للخلفيات الخفيفة. */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

/** هل اللون فاتح؟ تُستخدم لاختيار لون نص مقروء فوقه. */
export function isLight(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}
