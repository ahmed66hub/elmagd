"use client";

import { AdminPane, FieldRow } from "@/components/admin/admin-pane";
import { DebouncedArea, DebouncedText } from "@/components/admin/debounced-fields";
import { ImagePicker } from "@/components/admin/image-picker";
import { ItemList } from "@/components/admin/item-list";
import { useContent } from "@/components/providers";

export function WorksPane() {
  const { content } = useContent();

  return (
    <AdminPane
      title="معرض الأعمال"
      subtitle="ارفع صورة لكل عمل وحدّد الفئة والخامة والمقاس."
    >
      <ItemList
        collection="works"
        items={content.works}
        titleOf={(work) => work.title}
        addLabel="+ إضافة عمل جديد"
        renderFields={(work, update) => (
          <>
            <FieldRow>
              <DebouncedText
                label="عنوان العمل"
                value={work.title}
                onCommit={(title) => update({ title })}
              />
              <DebouncedText
                label="الفئة"
                value={work.category}
                onCommit={(category) => update({ category })}
              />
            </FieldRow>

            <DebouncedArea
              label="الوصف"
              value={work.description}
              onCommit={(description) => update({ description })}
            />

            <FieldRow>
              <DebouncedText
                label="الخامة"
                value={work.material}
                onCommit={(material) => update({ material })}
              />
              <DebouncedText
                label="المقاس"
                value={work.size}
                dir="ltr"
                className="ltr-num"
                onCommit={(size) => update({ size })}
              />
            </FieldRow>

            <DebouncedText
              label="زمن الطباعة"
              value={work.printTime}
              dir="ltr"
              className="ltr-num"
              onCommit={(printTime) => update({ printTime })}
            />

            <ImagePicker
              label="الصورة"
              value={work.image}
              onChange={(image) => update({ image })}
            />
          </>
        )}
      />
    </AdminPane>
  );
}
