/**
 * الأنواع المشتركة بين apps/web و apps/api.
 * هذه الأنواع هي العقد (contract) بين الـ frontend والـ backend:
 * أي تغيير هنا يجب أن ينعكس على الجداول في supabase/schema.sql.
 */

export * from "./content";
export * from "./quote";
export * from "./order";
export * from "./auth";
