"use client";

import { AdminPane } from "@/components/admin/admin-pane";
import { DebouncedText } from "@/components/admin/debounced-fields";
import { useContent } from "@/components/providers";
import { NAV_ORDER, PAGE_ROUTES } from "@/lib/config/site";
import { DEFAULT_SETTINGS } from "@/lib/data/seed";

export function PagesPane() {
  const { content, updateSettings } = useContent();
  const { pages, labels } = content.settings;

  return (
    <AdminPane
      title="الصفحات والقائمة"
      subtitle="أظهر أو أخفِ أي صفحة، وغيّر اسمها في القائمة."
    >
      {NAV_ORDER.map((key) => (
        <div key={key} className="mb-2.5 rounded-card border border-edge bg-card-2 p-3.5">
          <div className="mb-2.5 flex items-center gap-2.5">
            <input
              id={`page-${key}`}
              type="checkbox"
              checked={pages[key]}
              disabled={key === "home"}
              onChange={(event) =>
                void updateSettings((settings) => ({
                  ...settings,
                  pages: { ...settings.pages, [key]: event.target.checked },
                }))
              }
              className="size-4 accent-[var(--color-brand)]"
            />
            <label htmlFor={`page-${key}`} className="flex-1 font-display text-[15px] text-ink">
              {DEFAULT_SETTINGS.labels[key]}
            </label>
            <span className="ltr-num text-[11px] text-soft">{PAGE_ROUTES[key]}</span>
          </div>

          <DebouncedText
            label="الاسم في القائمة"
            value={labels[key]}
            onCommit={(label) =>
              void updateSettings((settings) => ({
                ...settings,
                labels: { ...settings.labels, [key]: label },
              }))
            }
          />
        </div>
      ))}

      <p className="text-[11.5px] text-soft">
        الصفحة الرئيسية ولوحة التحكم متاحتان دائمًا.
      </p>
    </AdminPane>
  );
}
