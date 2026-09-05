import type { Order, OrderDraft, OrderStatus } from "@elmagd/types";

import { getSupabase, isSupabaseEnabled, supabaseError } from "@/lib/supabase/client";
import { toOrder, type OrderRow } from "@/lib/supabase/mappers";

/**
 * الطلبات بلا سيرفر وسيط — ومع ذلك بلا ثغرة.
 *
 * الإدراج لا يمر على جدول orders مباشرة (لا توجد سياسة insert تسمح بذلك)،
 * بل على دالة submit_order داخل Postgres. الدالة تتحقق من المدخلات وتعيد
 * حساب السعر من أسعار الخامات في القاعدة، فأي سعر يرسله المتصفح يُتجاهل.
 *
 * القراءة وتغيير الحالة محصورتان في المالك عبر RLS: استدعاؤهما من متصفح
 * أي زائر يعود بصفر صفوف أو بخطأ صلاحيات.
 */

export async function submitOrder(draft: OrderDraft): Promise<Order | null> {
  if (!isSupabaseEnabled()) return null;

  const { data, error } = await getSupabase().rpc("submit_order", { payload: draft });
  if (error) throw supabaseError(error, "تعذّر تسجيل الطلب");

  return data ? toOrder(data as OrderRow) : null;
}

export interface OrdersPage {
  data: Order[];
  total: number;
}

const PAGE_SIZE = 20;

export async function fetchOrders(page = 1, status?: OrderStatus): Promise<OrdersPage> {
  const from = (Math.max(1, page) - 1) * PAGE_SIZE;

  let query = getSupabase()
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) throw supabaseError(error, "تعذّر تحميل الطلبات");

  return {
    data: ((data ?? []) as OrderRow[]).map(toOrder),
    total: count ?? 0,
  };
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data, error } = await getSupabase()
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw supabaseError(error, "تعذّر تحديث حالة الطلب");

  return toOrder(data as OrderRow);
}
