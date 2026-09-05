"use client";

import { AdminPane, FieldRow } from "@/components/admin/admin-pane";
import { DebouncedText } from "@/components/admin/debounced-fields";
import { ImagePicker } from "@/components/admin/image-picker";
import { useContent, useTheme } from "@/components/providers";
import { Chip } from "@/components/ui/chip";

export function BrandPane() {
  const { content, updateSettings } = useContent();
  const brand = content.settings.brand;
  const { setTheme } = useTheme();

  const patchBrand = (patch: Partial<typeof brand>) =>
    void updateSettings((settings) => ({
      ...settings,
      brand: { ...settings.brand, ...patch },
    }));

  return (
    <AdminPane title="الهوية والألوان" subtitle="اللوجو والاسم والألوان الأساسية للموقع.">
      <FieldRow>
        <DebouncedText
          label="اسم البراند"
          value={brand.name}
          onCommit={(name) => patchBrand({ name })}
        />
        <DebouncedText
          label="السطر تحت الاسم"
          value={brand.tagline}
          onCommit={(tagline) => patchBrand({ tagline })}
        />
      </FieldRow>

      <ImagePicker
        label="اللوجو"
        value={brand.logo}
        maxWidth={220}
        folder="brand"
        emptyLabel="بدون"
        onChange={(logo) => patchBrand({ logo })}
      />

      <div className="mb-3.5">
        <span className="mb-1.5 block text-[13.5px] text-soft">الألوان</span>
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="color"
            value={brand.color}
            aria-label="اللون الأساسي"
            onChange={(event) => patchBrand({ color: event.target.value })}
            className="h-9 w-11 cursor-pointer rounded-[5px] border border-edge bg-card p-0.5"
          />
          <span className="text-[11.5px] text-soft">اللون الأساسي</span>

          <input
            type="color"
            value={brand.accent}
            aria-label="لون التمييز"
            onChange={(event) => patchBrand({ accent: event.target.value })}
            className="h-9 w-11 cursor-pointer rounded-[5px] border border-edge bg-card p-0.5"
          />
          <span className="text-[11.5px] text-soft">لون التمييز</span>
        </div>
      </div>

      <div className="mb-3.5">
        <span className="mb-1.5 block text-[13.5px] text-soft">
          الوضع الافتراضي للزوار الجدد
        </span>
        <div className="flex gap-1.5">
          <Chip
            arabic
            active={brand.theme !== "dark"}
            onClick={() => {
              patchBrand({ theme: "light" });
              setTheme("light");
            }}
          >
            فاتح
          </Chip>
          <Chip
            arabic
            active={brand.theme === "dark"}
            onClick={() => {
              patchBrand({ theme: "dark" });
              setTheme("dark");
            }}
          >
            داكن
          </Chip>
        </div>
      </div>
    </AdminPane>
  );
}
