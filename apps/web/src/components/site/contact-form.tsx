"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

import { useSettings, useToast } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextArea, TextInput } from "@/components/ui/field";
import { WhatsappIcon } from "@/components/ui/icons";
import { submitOrder } from "@/lib/data/orders";
import { buildContactMessage, buildWhatsappLink } from "@/lib/domain/whatsapp";

const contactSchema = z.object({
  customerName: z.string().trim().min(2, "اكتب اسمك من فضلك"),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[\d\s+()-]{8,}$/, "اكتب رقم واتساب صحيح"),
  details: z.string().trim().min(10, "اكتب تفاصيل الطلب — 10 أحرف على الأقل"),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

/**
 * لا يوجد دفع أونلاين: النموذج يبني رسالة واتساب مرتّبة ويفتح المحادثة مباشرة،
 * ويسجّل الطلب في Supabase بالتوازي عبر دالة submit_order داخل القاعدة.
 */
export function ContactForm() {
  const settings = useSettings();
  const { notify } = useToast();
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const parsed = contactSchema.safeParse({
      customerName: formData.get("customerName"),
      whatsapp: formData.get("whatsapp"),
      details: formData.get("details"),
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const message = buildContactMessage(parsed.data, settings.brand.name);
    const href = buildWhatsappLink(settings.contact.whatsapp, message);

    // فتح واتساب داخل نقرة المستخدم مباشرة حتى لا يحجبه المتصفح،
    // ثم تسجيل الطلب في القاعدة بالتوازي.
    window.open(href, "_blank", "noopener,noreferrer");
    notify("تم تجهيز رسالة الواتساب");

    void submitOrder({ ...parsed.data, source: "contact" }).catch(() =>
      notify("تم فتح واتساب، لكن تعذّر تسجيل الطلب في النظام."),
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} noValidate>
        <TextInput
          name="customerName"
          label="الاسم"
          placeholder="اسمك"
          autoComplete="name"
          error={errors.customerName}
        />
        <TextInput
          name="whatsapp"
          label="رقم واتساب"
          placeholder="01xxxxxxxxx"
          inputMode="tel"
          autoComplete="tel"
          className="ltr-num"
          error={errors.whatsapp}
        />
        <TextArea
          name="details"
          label="تفاصيل الطلب"
          placeholder="اكتب فكرتك أو أرفق مقاسات تقريبية"
          error={errors.details}
        />

        <Button type="submit">
          <WhatsappIcon className="size-4" />
          إرسال على واتساب
        </Button>

        <p className="mt-2.5 text-[11.5px] text-soft">
          لا يوجد دفع أونلاين — الطلب يفتح محادثة واتساب بتفاصيلك جاهزة.
        </p>
      </form>
    </Card>
  );
}
