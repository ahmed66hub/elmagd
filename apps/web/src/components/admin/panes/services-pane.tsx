"use client";

import { AdminPane, FieldRow } from "@/components/admin/admin-pane";
import { DebouncedArea, DebouncedText } from "@/components/admin/debounced-fields";
import { ItemList } from "@/components/admin/item-list";
import { useContent } from "@/components/providers";

export function ServicesPane() {
  const { content } = useContent();

  return (
    <AdminPane title="الخدمات والأسعار" subtitle="أضف أو عدّل أو احذف أي خدمة.">
      <ItemList
        collection="services"
        items={content.services}
        titleOf={(service) => service.title}
        addLabel="+ إضافة خدمة جديدة"
        renderFields={(service, update) => (
          <>
            <FieldRow>
              <DebouncedText
                label="اسم الخدمة"
                value={service.title}
                onCommit={(title) => update({ title })}
              />
              <DebouncedText
                label="السعر يبدأ من"
                value={service.price}
                dir="ltr"
                className="ltr-num"
                onCommit={(price) => update({ price })}
              />
            </FieldRow>
            <DebouncedArea
              label="الوصف"
              value={service.description}
              onCommit={(description) => update({ description })}
            />
          </>
        )}
      />
    </AdminPane>
  );
}
