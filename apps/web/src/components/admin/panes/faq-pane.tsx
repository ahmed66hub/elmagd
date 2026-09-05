"use client";

import { AdminPane } from "@/components/admin/admin-pane";
import { DebouncedArea, DebouncedText } from "@/components/admin/debounced-fields";
import { ItemList } from "@/components/admin/item-list";
import { useContent } from "@/components/providers";

export function FaqPane() {
  const { content } = useContent();

  return (
    <AdminPane
      title="الأسئلة الشائعة"
      subtitle="أضف الأسئلة التي تتكرر عليك في الرسائل."
    >
      <ItemList
        collection="faq"
        items={content.faq}
        titleOf={(item) => item.question}
        addLabel="+ إضافة سؤال جديد"
        renderFields={(item, update) => (
          <>
            <DebouncedText
              label="السؤال"
              value={item.question}
              onCommit={(question) => update({ question })}
            />
            <DebouncedArea
              label="الإجابة"
              value={item.answer}
              onCommit={(answer) => update({ answer })}
            />
          </>
        )}
      />
    </AdminPane>
  );
}
