import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * يكتب supabase/seed.sql من محتوى البداية في الواجهة.
 *
 *   npm run seed:sql        (يحتاج Node 22.15 أو أحدث)
 *
 * كود الواجهة يستورد بلا لاحقة (أسلوب الـ bundler)، وNode يطلب لاحقة صريحة،
 * لذلك نضيف هنا خطّاف resolve صغيرًا يكمّل .ts — حتى لا نضطر لتشويه أسلوب
 * الاستيراد في كود المشروع من أجل سكربت واحد.
 */
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
      const base = new URL(specifier, context.parentURL);
      for (const candidate of [`${base.href}.ts`, `${base.href}/index.ts`]) {
        if (existsSync(fileURLToPath(candidate))) {
          return { url: candidate, shortCircuit: true };
        }
      }
    }
    return nextResolve(specifier, context);
  },
});

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, "..", "supabase", "seed.sql");

const { buildSeedSql } = await import("../apps/web/src/lib/data/seed-sql.ts");

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, buildSeedSql(), "utf8");

console.log(`تم توليد ${target}`);
