import type {
  CollectionItemMap,
  CollectionKey,
  FaqItem,
  Material,
  Order,
  OrderSource,
  OrderStatus,
  Service,
  StoredQuote,
  Work,
} from "@elmagd/types";

/**
 * الترجمة بين أعمدة Postgres (snake_case) وأنواع المشروع (camelCase).
 *
 * مكان واحد لهذه الترجمة يعني أن تغيير اسم عمود لا يمس أي component،
 * وأن الواجهة تبقى مكتوبة بلغة المجال لا بلغة الجدول.
 * ملاحظة: عمود الترتيب اسمه position لأن order كلمة محجوزة في SQL.
 */

export interface ServiceRow {
  id: string;
  position: number;
  title: string;
  description: string;
  price: string;
}

export interface WorkRow {
  id: string;
  position: number;
  title: string;
  category: string;
  description: string;
  material: string;
  size: string;
  print_time: string;
  image: string;
}

export interface FaqRow {
  id: string;
  position: number;
  question: string;
  answer: string;
}

export interface MaterialRow {
  id: string;
  position: number;
  name: string;
  tagline: string;
  price_per_gram: number | string;
  density: number | string;
  strength: number;
  heat_resistance: number;
}

export interface OrderRow {
  id: string;
  customer_name: string;
  whatsapp: string;
  details: string;
  file_name: string | null;
  material_name: string | null;
  quote: StoredQuote | null;
  status: OrderStatus;
  source: OrderSource;
  customer_id: string | null;
  created_at: string | null;
}

/** أسماء الجداول لكل مجموعة. */
export const TABLE_NAMES: Record<CollectionKey, string> = {
  services: "services",
  works: "works",
  faq: "faq_items",
  materials: "materials",
};

/** numeric في Postgres يصل كنص للحفاظ على الدقة — نعيده رقمًا. */
function toNumber(value: number | string | null | undefined): number {
  return typeof value === "number" ? value : Number(value ?? 0);
}

export function toService(row: ServiceRow): Service {
  return {
    id: row.id,
    order: row.position,
    title: row.title,
    description: row.description,
    price: row.price,
  };
}

export function toWork(row: WorkRow): Work {
  return {
    id: row.id,
    order: row.position,
    title: row.title,
    category: row.category,
    description: row.description,
    material: row.material,
    size: row.size,
    printTime: row.print_time,
    image: row.image,
  };
}

export function toFaqItem(row: FaqRow): FaqItem {
  return {
    id: row.id,
    order: row.position,
    question: row.question,
    answer: row.answer,
  };
}

export function toMaterial(row: MaterialRow): Material {
  return {
    id: row.id,
    order: row.position,
    name: row.name,
    tagline: row.tagline,
    pricePerGram: toNumber(row.price_per_gram),
    density: toNumber(row.density),
    strength: row.strength,
    heatResistance: row.heat_resistance,
  };
}

export function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    whatsapp: row.whatsapp,
    details: row.details,
    fileName: row.file_name,
    materialName: row.material_name,
    quote: row.quote,
    status: row.status,
    source: row.source,
    customerId: row.customer_id,
    createdAt: row.created_at,
  };
}

/** تحويل عنصر مجموعة إلى صف جاهز للـ upsert. */
export function toRow<K extends CollectionKey>(
  collection: K,
  item: CollectionItemMap[K],
): Record<string, unknown> {
  switch (collection) {
    case "services": {
      const value = item as Service;
      return {
        id: value.id,
        position: value.order,
        title: value.title,
        description: value.description,
        price: value.price,
      };
    }
    case "works": {
      const value = item as Work;
      return {
        id: value.id,
        position: value.order,
        title: value.title,
        category: value.category,
        description: value.description,
        material: value.material,
        size: value.size,
        print_time: value.printTime,
        image: value.image,
      };
    }
    case "faq": {
      const value = item as FaqItem;
      return {
        id: value.id,
        position: value.order,
        question: value.question,
        answer: value.answer,
      };
    }
    default: {
      const value = item as Material;
      return {
        id: value.id,
        position: value.order,
        name: value.name,
        tagline: value.tagline,
        price_per_gram: value.pricePerGram,
        density: value.density,
        strength: value.strength,
        heat_resistance: value.heatResistance,
      };
    }
  }
}
