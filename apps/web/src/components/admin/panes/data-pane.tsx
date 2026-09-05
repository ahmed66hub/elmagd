"use client";

import { useRef, useState } from "react";
import type { SiteContent } from "@elmagd/types";

import { AdminPane } from "@/components/admin/admin-pane";
import { useContent, useToast } from "@/components/providers";
import { Button } from "@/components/ui/button";

export function DataPane() {
  const { content, importContent, resetContent, source } = useContent();
  const { notify } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function handleExport() {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `elmagd-site-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    notify("تم التصدير");
  }

  async function handleImport(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as SiteContent;
      if (!parsed.settings || !Array.isArray(parsed.services)) {
        throw new Error("بنية غير متوقعة");
      }
      await importContent(parsed);
      notify("تم الاستيراد");
    } catch {
      notify("ملف غير صالح");
    }
  }

  return (
    <AdminPane
      title="النسخ والاستعادة"
      subtitle="صدّر كل محتوى الموقع كملف JSON أو استعده."
    >
      <div className="flex flex-wrap gap-2.5">
        <Button variant="outline" onClick={handleExport}>
          تصدير JSON
        </Button>
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          استيراد JSON
        </Button>

        {confirmReset ? (
          <>
            <Button
              variant="danger"
              onClick={async () => {
                await resetContent();
                setConfirmReset(false);
                notify("تمت الاستعادة");
              }}
            >
              تأكيد إعادة كل شيء
            </Button>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              إلغاء
            </Button>
          </>
        ) : (
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            إعادة كل شيء للأصل
          </Button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleImport(file);
            event.target.value = "";
          }}
        />
      </div>

      <p className="mt-4 text-[11.5px] text-soft">
        {source === "supabase"
          ? "الحفظ في قاعدة البيانات مفعّل: أي تعديل يُحفظ على Supabase ويظهر لكل من يفتح الموقع."
          : "الحفظ حاليًا في هذا المتصفح فقط. عند ضبط مفاتيح Supabase ينتقل الحفظ إلى قاعدة البيانات تلقائيًا."}
      </p>

      <div className="mt-6 rounded-card border border-edge bg-card-2 p-4">
        <h3 className="mb-2 text-[15px]">ملخّص المحتوى الحالي</h3>
        <ul className="ltr-num space-y-1 text-[13px] text-soft">
          <li>services: {content.services.length}</li>
          <li>works: {content.works.length}</li>
          <li>materials: {content.materials.length}</li>
          <li>faq: {content.faq.length}</li>
        </ul>
      </div>
    </AdminPane>
  );
}
