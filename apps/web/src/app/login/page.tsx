import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "دخول المالك",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-16">
      <div className="w-full max-w-[380px]">
        <div className="mb-6 text-center">
          <h1 className="text-2xl">دخول المالك</h1>
          <p className="mt-2 text-sm text-soft">
            لوحة التحكم مخصّصة لمالك الموقع وحده.
          </p>
        </div>

        <Card className="p-6">
          <LoginForm />
        </Card>

        <p className="mt-5 text-center text-[13px] text-soft">
          <Link href="/" className="hover:text-ink">
            ← العودة إلى الموقع
          </Link>
        </p>
      </div>
    </main>
  );
}
