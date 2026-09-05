"use client";

import { useState, type ReactNode } from "react";
import type { CollectionItemMap, CollectionKey } from "@elmagd/types";

import { useContent, useToast } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon } from "@/components/ui/icons";
import { formatIndex } from "@/lib/utils/format";

interface ItemListProps<K extends CollectionKey> {
  collection: K;
  items: CollectionItemMap[K][];
  /** العنوان الظاهر في رأس كل عنصر. */
  titleOf: (item: CollectionItemMap[K]) => string;
  /** حقول تحرير العنصر — update تحفظ تلقائيًا. */
  renderFields: (
    item: CollectionItemMap[K],
    update: (patch: Partial<CollectionItemMap[K]>) => void,
  ) => ReactNode;
  addLabel?: string;
}

/**
 * قائمة CRUD موحّدة لكل المجموعات (الخدمات، الأعمال، الخامات، الأسئلة):
 * إضافة، تحرير فوري، إعادة ترتيب، وحذف بتأكيد داخل الصفحة.
 */
export function ItemList<K extends CollectionKey>({
  collection,
  items,
  titleOf,
  renderFields,
  addLabel = "+ إضافة عنصر جديد",
}: ItemListProps<K>) {
  const { saveItem, addItem, deleteItem, moveItem } = useContent();
  const { notify } = useToast();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  return (
    <>
      <div>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="mb-2.5 rounded-card border border-edge bg-card-2 p-3.5"
          >
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="ltr-num text-brand">{formatIndex(index)}</span>
              <b className="flex-1 font-display text-[15px] text-ink">{titleOf(item)}</b>

              <span className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="تحريك لأعلى"
                  disabled={index === 0}
                  onClick={() => void moveItem(collection, item.id, -1)}
                >
                  <ArrowUpIcon className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="تحريك لأسفل"
                  disabled={index === items.length - 1}
                  onClick={() => void moveItem(collection, item.id, 1)}
                >
                  <ArrowDownIcon className="size-3.5" />
                </Button>

                {pendingDelete === item.id ? (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={async () => {
                        await deleteItem(collection, item.id);
                        setPendingDelete(null);
                        notify("تم الحذف");
                      }}
                    >
                      تأكيد الحذف
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingDelete(null)}
                    >
                      إلغاء
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setPendingDelete(item.id)}
                  >
                    حذف
                  </Button>
                )}
              </span>
            </div>

            {renderFields(item, (patch) => {
              void saveItem(collection, { ...item, ...patch });
            })}
          </div>
        ))}
      </div>

      <Button
        onClick={async () => {
          await addItem(collection);
          notify("تمت الإضافة");
        }}
      >
        {addLabel}
      </Button>
    </>
  );
}
