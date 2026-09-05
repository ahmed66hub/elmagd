/** تنسيقات عرض موحّدة عبر الموقع (أرقام لاتينية داخل نص عربي). */

const numberFormatter = new Intl.NumberFormat("en-US");

export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPrice(value: number, currency: string): string {
  return `${numberFormatter.format(Math.round(value))} ${currency}`;
}

/** تحويل الساعات العشرية إلى صيغة "12h 30m". */
export function formatHours(hours: number): string {
  let whole = Math.floor(hours);
  let minutes = Math.round((hours - whole) * 60);
  if (minutes === 60) {
    whole += 1;
    minutes = 0;
  }
  return `${whole}h ${minutes.toString().padStart(2, "0")}m`;
}

/** ترقيم الصفوف: 01، 02، ... */
export function formatIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function formatDays(days: number): string {
  if (days === 1) return "يوم واحد";
  if (days === 2) return "يومان";
  if (days <= 10) return `${days} أيام`;
  return `${days} يومًا`;
}
