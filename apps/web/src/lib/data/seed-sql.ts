import { createDefaultContent } from "./seed";

/**
 * توليد ملف supabase/seed.sql من نفس محتوى البداية الذي تستخدمه الواجهة.
 *
 * الغرض: ألا يوجد مصدران للحقيقة. المحتوى الافتراضي مكتوب مرة واحدة في
 * seed.ts، وهذا المولّد يترجمه إلى SQL، ويحرس التطابقَ اختبارُ seed-sql.test.ts
 * الذي يقارن الملف المولَّد بالملف المحفوظ في المستودع.
 *
 * التحديث بعد أي تعديل في seed.ts:  npm run seed:sql
 */

/** نص SQL آمن: تضعيف علامة الاقتباس المفردة هو الهروب الوحيد المطلوب. */
function text(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** كائن JSON كقيمة jsonb. */
function json(value: unknown): string {
  return `${text(JSON.stringify(value))}::jsonb`;
}

function num(value: number): string {
  return String(value);
}

export function buildSeedSql(): string {
  const content = createDefaultContent();
  const { settings } = content;

  const settingRows: Array<[string, unknown]> = [
    ["brand", settings.brand],
    ["hero", settings.hero],
    ["about", settings.about],
    ["contact", settings.contact],
    ["pricing", settings.pricing],
    ["pages", settings.pages],
    ["labels", settings.labels],
  ];

  const lines: string[] = [
    "-- =====================================================================",
    "-- 3D Elmagd — محتوى البداية",
    "-- ---------------------------------------------------------------------",
    "-- مولَّد آليًا من apps/web/src/lib/data/seed.ts — لا تعدّله يدويًا.",
    "-- لإعادة توليده بعد أي تعديل على المحتوى الافتراضي:  npm run seed:sql",
    "--",
    "-- التشغيل: Supabase Dashboard → SQL Editor، بعد supabase/schema.sql.",
    "-- الملف idempotent: تشغيله مرة أخرى يعيد القيم الافتراضية ولا يكسر شيئًا.",
    "-- =====================================================================",
    "",
    "insert into public.settings (key, value) values",
  ];

  lines.push(
    settingRows
      .map(([key, value]) => `  (${text(key)}, ${json(value)})`)
      .join(",\n") +
      "\non conflict (key) do update set value = excluded.value, updated_at = now();",
  );

  lines.push("", "insert into public.services (id, position, title, description, price) values");
  lines.push(
    content.services
      .map(
        (item) =>
          `  (${text(item.id)}, ${num(item.order)}, ${text(item.title)}, ${text(item.description)}, ${text(item.price)})`,
      )
      .join(",\n") +
      "\non conflict (id) do update set" +
      "\n  position = excluded.position," +
      "\n  title = excluded.title," +
      "\n  description = excluded.description," +
      "\n  price = excluded.price," +
      "\n  updated_at = now();",
  );

  lines.push(
    "",
    "insert into public.works (id, position, title, category, description, material, size, print_time, image) values",
  );
  lines.push(
    content.works
      .map(
        (item) =>
          `  (${text(item.id)}, ${num(item.order)}, ${text(item.title)}, ${text(item.category)}, ${text(item.description)}, ${text(item.material)}, ${text(item.size)}, ${text(item.printTime)}, ${text(item.image)})`,
      )
      .join(",\n") +
      "\non conflict (id) do update set" +
      "\n  position = excluded.position," +
      "\n  title = excluded.title," +
      "\n  category = excluded.category," +
      "\n  description = excluded.description," +
      "\n  material = excluded.material," +
      "\n  size = excluded.size," +
      "\n  print_time = excluded.print_time," +
      "\n  image = excluded.image," +
      "\n  updated_at = now();",
  );

  lines.push("", "insert into public.faq_items (id, position, question, answer) values");
  lines.push(
    content.faq
      .map(
        (item) =>
          `  (${text(item.id)}, ${num(item.order)}, ${text(item.question)}, ${text(item.answer)})`,
      )
      .join(",\n") +
      "\non conflict (id) do update set" +
      "\n  position = excluded.position," +
      "\n  question = excluded.question," +
      "\n  answer = excluded.answer," +
      "\n  updated_at = now();",
  );

  lines.push(
    "",
    "insert into public.materials (id, position, name, tagline, price_per_gram, density, strength, heat_resistance) values",
  );
  lines.push(
    content.materials
      .map(
        (item) =>
          `  (${text(item.id)}, ${num(item.order)}, ${text(item.name)}, ${text(item.tagline)}, ${num(item.pricePerGram)}, ${num(item.density)}, ${num(item.strength)}, ${num(item.heatResistance)})`,
      )
      .join(",\n") +
      "\non conflict (id) do update set" +
      "\n  position = excluded.position," +
      "\n  name = excluded.name," +
      "\n  tagline = excluded.tagline," +
      "\n  price_per_gram = excluded.price_per_gram," +
      "\n  density = excluded.density," +
      "\n  strength = excluded.strength," +
      "\n  heat_resistance = excluded.heat_resistance," +
      "\n  updated_at = now();",
  );

  return `${lines.join("\n")}\n`;
}
