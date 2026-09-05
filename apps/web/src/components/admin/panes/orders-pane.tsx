"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order, OrderStatus } from "@elmagd/types";
import { ORDER_STATUS_LABELS } from "@elmagd/types";

import { AdminPane } from "@/components/admin/admin-pane";
import { useToast } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/chip";
import { WhatsappIcon } from "@/components/ui/icons";
import { fetchOrders, updateOrderStatus } from "@/lib/data/orders";
import { isSupabaseEnabled } from "@/lib/supabase/client";
import { buildWhatsappLink } from "@/lib/domain/whatsapp";
import { formatHours } from "@/lib/utils/format";

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

const STATUS_TONE: Record<OrderStatus, string> = {
  new: "border-brand text-brand",
  quoted: "border-edge-2 text-body",
  confirmed: "border-ok text-ok",
  printing: "border-accent text-accent",
  ready: "border-ok text-ok",
  delivered: "border-edge-2 text-soft",
  cancelled: "border-danger text-danger",
};

export function OrdersPane() {
  const { notify } = useToast();
  // null = لم يصل رد بعد. حالة التحميل مشتقّة منها بدل setState داخل الـ effect.
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [refreshToken, setRefreshToken] = useState(0);

  // جلب البيانات بنمط React الموصى به: الاستجابة تصل في callback،
  // وعلم ignore يمنع كتابة نتيجة قديمة بعد تغيير الفلتر.
  useEffect(() => {
    if (!isSupabaseEnabled()) return;

    let ignore = false;

    fetchOrders(1, filter === "all" ? undefined : filter)
      .then((page) => {
        if (ignore) return;
        setOrders(page.data);
        setTotal(page.total);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (ignore) return;
        setOrders([]);
        setError(caught instanceof Error ? caught.message : "تعذّر تحميل الطلبات");
      });

    return () => {
      ignore = true;
    };
  }, [filter, refreshToken]);

  const isLoading = orders === null;

  const changeStatus = useCallback(
    async (order: Order, status: OrderStatus) => {
      try {
        const updated = await updateOrderStatus(order.id, status);
        setOrders((current) =>
          current
            ? current.map((entry) => (entry.id === updated.id ? updated : entry))
            : current,
        );
        notify("تم تحديث حالة الطلب");
      } catch {
        notify("تعذّر تحديث حالة الطلب");
      }
    },
    [notify],
  );

  if (!isSupabaseEnabled()) {
    return (
      <AdminPane title="الطلبات" subtitle="سجل الطلبات القادمة من الموقع.">
        <p className="rounded-card border border-dashed border-edge-2 p-8 text-center text-soft">
          سجل الطلبات يحتاج قاعدة البيانات.
          <br />
          اضبط مفاتيح <span className="ltr-num">Supabase</span> في ملف البيئة.
        </p>
      </AdminPane>
    );
  }

  return (
    <AdminPane
      title="الطلبات"
      subtitle="كل طلب يُسجَّل هنا قبل فتح محادثة الواتساب — بلا دفع أونلاين."
    >
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          الكل
        </FilterChip>
        {STATUSES.map((status) => (
          <FilterChip
            key={status}
            active={filter === status}
            onClick={() => setFilter(status)}
          >
            {ORDER_STATUS_LABELS[status]}
          </FilterChip>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="ms-auto"
          onClick={() => setRefreshToken((token) => token + 1)}
        >
          تحديث
        </Button>
      </div>

      {error ? (
        <p className="mb-4 rounded-[5px] border border-danger px-3 py-2 text-[12.5px] text-danger">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="p-8 text-center text-soft">جارِ التحميل…</p>
      ) : orders.length === 0 ? (
        <p className="rounded-card border border-dashed border-edge-2 p-8 text-center text-soft">
          لا توجد طلبات في هذه الحالة.
        </p>
      ) : (
        <>
          <p className="mb-3 text-[12.5px] text-soft">
            إجمالي الطلبات: <span className="ltr-num">{total}</span>
          </p>

          {orders.map((order) => (
            <article
              key={order.id}
              className="mb-2.5 rounded-card border border-edge bg-card-2 p-4"
            >
              <header className="mb-2.5 flex flex-wrap items-center gap-2.5">
                <b className="font-display text-[15px] text-ink">{order.customerName}</b>
                <span
                  className={`ltr-num rounded border px-2 py-0.5 text-[10px] ${STATUS_TONE[order.status]}`}
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
                <span className="ltr-num text-[11.5px] text-soft">
                  {order.createdAt ? order.createdAt.slice(0, 16).replace("T", " ") : ""}
                </span>

                <a
                  href={buildWhatsappLink(order.whatsapp, "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-auto inline-flex items-center gap-1.5 text-[13px] text-brand hover:underline"
                >
                  <WhatsappIcon className="size-4" />
                  <span className="ltr-num">{order.whatsapp}</span>
                </a>
              </header>

              <p className="mb-3 whitespace-pre-line text-[13.5px] text-body">
                {order.details}
              </p>

              {order.quote ? (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {[
                    `${order.quote.price} ${order.quote.currency}`,
                    `${order.quote.weightGrams} g`,
                    formatHours(order.quote.hours),
                    order.quote.materialName,
                    `×${order.quote.quantity}`,
                    order.fileName,
                  ]
                    .filter(Boolean)
                    .map((chip) => (
                      <span
                        key={String(chip)}
                        className="ltr-num rounded border border-edge-2 px-1.5 py-px text-[10.5px] text-brand"
                      >
                        {chip}
                      </span>
                    ))}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-1.5">
                {STATUSES.filter((status) => status !== order.status).map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    onClick={() => void changeStatus(order, status)}
                  >
                    {ORDER_STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
            </article>
          ))}
        </>
      )}
    </AdminPane>
  );
}
