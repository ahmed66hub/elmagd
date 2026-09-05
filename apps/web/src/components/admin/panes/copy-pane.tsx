"use client";

import { AdminPane, FieldRow } from "@/components/admin/admin-pane";
import { DebouncedArea, DebouncedText } from "@/components/admin/debounced-fields";
import { useContent } from "@/components/providers";

export function CopyPane() {
  const { content, updateSettings } = useContent();
  const { hero, about } = content.settings;

  const patchHero = (patch: Partial<typeof hero>) =>
    void updateSettings((settings) => ({
      ...settings,
      hero: { ...settings.hero, ...patch },
    }));

  const patchAbout = (patch: Partial<typeof about>) =>
    void updateSettings((settings) => ({
      ...settings,
      about: { ...settings.about, ...patch },
    }));

  const patchStat = (index: number, patch: { value?: string; label?: string }) =>
    patchHero({
      stats: hero.stats.map((stat, position) =>
        position === index ? { ...stat, ...patch } : stat,
      ),
    });

  return (
    <AdminPane title="نصوص الموقع" subtitle="كل جملة تظهر في الصفحة الرئيسية.">
      <DebouncedText
        label="شريط الحالة أعلى العنوان"
        value={hero.pillText}
        onCommit={(pillText) => patchHero({ pillText })}
      />

      <FieldRow>
        <DebouncedText
          label="العنوان الرئيسي"
          value={hero.title}
          onCommit={(title) => patchHero({ title })}
        />
        <DebouncedText
          label="الجزء الملوّن من العنوان"
          value={hero.highlight}
          onCommit={(highlight) => patchHero({ highlight })}
        />
      </FieldRow>

      <DebouncedArea
        label="النص التعريفي"
        value={hero.text}
        onCommit={(text) => patchHero({ text })}
      />

      <FieldRow>
        <DebouncedText
          label="زر رئيسي"
          value={hero.ctaMain}
          onCommit={(ctaMain) => patchHero({ ctaMain })}
        />
        <DebouncedText
          label="زر ثانوي"
          value={hero.ctaAlt}
          onCommit={(ctaAlt) => patchHero({ ctaAlt })}
        />
      </FieldRow>

      <h3 className="mt-6 mb-3 text-base">شريط الأرقام</h3>
      {hero.stats.map((stat, index) => (
        <FieldRow key={index}>
          <DebouncedText
            label={`رقم ${index + 1}`}
            value={stat.value}
            dir="ltr"
            className="ltr-num"
            onCommit={(value) => patchStat(index, { value })}
          />
          <DebouncedText
            label={`وصف ${index + 1}`}
            value={stat.label}
            onCommit={(label) => patchStat(index, { label })}
          />
        </FieldRow>
      ))}

      <h3 className="mt-6 mb-3 text-base">قسم الماكينة</h3>
      <DebouncedText
        label="العنوان"
        value={about.title}
        onCommit={(title) => patchAbout({ title })}
      />
      <DebouncedArea
        label="الوصف"
        value={about.text}
        onCommit={(text) => patchAbout({ text })}
      />

      <h4 className="mt-5 mb-3 text-[15px]">مواصفات الماكينة</h4>
      {about.specs.map((spec, index) => (
        <FieldRow key={index}>
          <DebouncedText
            label="البند"
            value={spec.label}
            onCommit={(label) =>
              patchAbout({
                specs: about.specs.map((entry, position) =>
                  position === index ? { ...entry, label } : entry,
                ),
              })
            }
          />
          <DebouncedText
            label="القيمة"
            value={spec.value}
            dir="ltr"
            className="ltr-num"
            onCommit={(value) =>
              patchAbout({
                specs: about.specs.map((entry, position) =>
                  position === index ? { ...entry, value } : entry,
                ),
              })
            }
          />
        </FieldRow>
      ))}
    </AdminPane>
  );
}
