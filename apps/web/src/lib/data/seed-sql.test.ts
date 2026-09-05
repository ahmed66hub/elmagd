import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { buildSeedSql } from "./seed-sql";

/**
 * محتوى البداية مكتوب مرة واحدة في seed.ts، وsupabase/seed.sql مولَّد منه.
 * هذا الاختبار يمنع انفصالهما: أي تعديل على المحتوى بلا إعادة توليد يُسقطه.
 *
 * الإصلاح عند السقوط:  npm run seed:sql
 */
describe("ملف الزرع في supabase مطابق لمحتوى البداية", () => {
  it("supabase/seed.sql محدَّث", () => {
    const committed = readFileSync(
      resolve(process.cwd(), "..", "..", "supabase", "seed.sql"),
      "utf8",
    );

    expect(committed).toBe(buildSeedSql());
  });
});
