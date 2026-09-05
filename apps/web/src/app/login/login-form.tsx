"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/field";
import { LockIcon } from "@/components/ui/icons";
import { ADMIN_ROUTE } from "@/lib/config/site";
import { isSupabaseEnabled } from "@/lib/supabase/client";

/**
 * الدخول عبر Supabase Auth.
 *
 * كلمة السر لا تُخزَّن في المشروع إطلاقًا: الحساب موجود في Supabase،
 * والتحقق يتم على خوادمه، والذي يعود إلى المتصفح توكن موقّع لا يمكن تزويره.
 * وحده هذا التوكن يفتح أبواب القاعدة، ولا يفتحها إلا إن كان بريده بريد المالك.
 */
export function LoginForm() {
  const { signIn, isOwner, isReady } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setPending] = useState(false);

  // المالك الداخل بالفعل لا يحتاج هذه الصفحة.
  useEffect(() => {
    if (isReady && isOwner) router.replace(ADMIN_ROUTE);
  }, [isOwner, isReady, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("أدخل البريد وكلمة السر.");
      return;
    }

    if (!isSupabaseEnabled()) {
      setError("بيانات Supabase غير مضبوطة في هذه النسخة.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      await signIn(email, password);
      router.replace(ADMIN_ROUTE);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذّر تسجيل الدخول.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        name="email"
        type="email"
        label="البريد الإلكتروني"
        autoComplete="username"
        dir="ltr"
        className="ltr-num text-start"
        required
      />
      <TextInput
        name="password"
        type="password"
        label="كلمة السر"
        autoComplete="current-password"
        dir="ltr"
        className="text-start"
        required
      />

      {error ? (
        <p
          role="alert"
          className="mb-3.5 rounded-[5px] border border-danger px-3 py-2 text-[12.5px] text-danger"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        <LockIcon className="size-4" />
        {isPending ? "جارِ التحقق…" : "دخول"}
      </Button>
    </form>
  );
}
