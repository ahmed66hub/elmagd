"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { OWNER_EMAIL, getSupabase, isSupabaseEnabled } from "@/lib/supabase/client";

/**
 * حالة الدخول كما يراها المتصفح.
 *
 * تنبيه مهم على التصميم: ما في هذا الملف تجميلي بالكامل. الموقع static
 * ويُقدَّم من GitHub Pages، فلا يوجد سيرفر يمنع أحدًا من فتح /admin.
 * الحارس الحقيقي هو Row Level Security في Postgres: من ليس المالك لا يقرأ
 * طلبًا ولا يكتب حرفًا مهما فعل بكود الصفحة. راجع supabase/schema.sql.
 *
 * الحساب اختياري تمامًا للعميل: الزائر بلا حساب يستخدم كل شيء —
 * التصفح، المعاين، حساب السعر، والطلب عبر واتساب.
 */

export interface AuthState {
  /** هل انتهى فحص الجلسة؟ قبل ذلك لا نُظهر ولا نُخفي شيئًا يعتمد عليها. */
  isReady: boolean;
  email: string | null;
  /** هل صاحب هذه الجلسة هو مالك الموقع؟ */
  isOwner: boolean;
  /** وضع التطوير المحلي بلا Supabase — لا يعمل أبدًا في نسخة الإنتاج. */
  isLocalPreview: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * بدون مفاتيح Supabase وفي وضع التطوير فقط، تُفتح اللوحة لمعاينة التصميم
 * على بيانات المتصفح المحلية. نسخة الإنتاج تُبنى بـ NODE_ENV=production
 * فتكون هذه القيمة false دائمًا.
 */
const LOCAL_PREVIEW = process.env.NODE_ENV === "development" && !isSupabaseEnabled();

export function AuthProvider({ children }: { children: ReactNode }) {
  // null = لم يصل رد من Supabase بعد. حالة الجاهزية مشتقّة منها،
  // فلا نحتاج setState داخل جسم الـ effect إطلاقًا.
  const [account, setAccount] = useState<{ email: string | null } | null>(null);

  useEffect(() => {
    if (!isSupabaseEnabled()) return;

    const supabase = getSupabase();
    let ignore = false;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!ignore) setAccount({ email: data.session?.user.email?.toLowerCase() ?? null });
      })
      .catch(() => {
        if (!ignore) setAccount({ email: null });
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccount({ email: session?.user.email?.toLowerCase() ?? null });
    });

    return () => {
      ignore = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const isReady = !isSupabaseEnabled() || account !== null;
  const email = account?.email ?? null;

  const signIn = useCallback(async (address: string, password: string) => {
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: address.trim(),
      password,
    });

    if (error) {
      // رسالة واحدة للحالتين حتى لا نكشف أي بريد مسجّل.
      throw new Error("البريد أو كلمة السر غير صحيحة.");
    }

    if (data.user?.email?.toLowerCase() !== OWNER_EMAIL) {
      await supabase.auth.signOut();
      throw new Error("هذا الحساب لا يملك صلاحية لوحة التحكم.");
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseEnabled()) await getSupabase().auth.signOut();
    setAccount({ email: null });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      isReady: isReady || LOCAL_PREVIEW,
      email,
      isOwner: LOCAL_PREVIEW || (email !== null && email === OWNER_EMAIL),
      isLocalPreview: LOCAL_PREVIEW,
      signIn,
      signOut,
    }),
    [email, isReady, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
  return context;
}
