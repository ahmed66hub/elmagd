/**
 * أدوار المستخدمين.
 * - guest: زائر بدون حساب — يستطيع تصفح الموقع وحساب السعر والطلب عبر واتساب بالكامل.
 * - customer: عميل سجّل بحساب Google — يضاف له سجل طلبات ومعاينات محفوظة.
 * - admin: مالك الموقع فقط — الوحيد الذي يرى لوحة التحكم.
 */
export type UserRole = "guest" | "customer" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

export interface AuthSession {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
