import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <span className="ltr-num mb-3 block text-[10.5px] tracking-[0.22em] text-brand uppercase">
          404
        </span>
        <h1 className="text-3xl">الصفحة غير موجودة</h1>
        <p className="mx-auto mt-3 max-w-[42ch] text-soft">
          الرابط الذي فتحته غير صحيح أو تم تغييره.
        </p>
        <Link href="/" className={buttonClasses("primary", "md", "mt-6")}>
          العودة إلى الرئيسية
        </Link>
      </div>
    </main>
  );
}
