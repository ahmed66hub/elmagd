"use client";

import { AdminPane, FieldRow } from "@/components/admin/admin-pane";
import { DebouncedText } from "@/components/admin/debounced-fields";
import { useContent } from "@/components/providers";
import { normalizeWhatsappNumber } from "@/lib/domain/whatsapp";

export function ContactPane() {
  const { content, updateSettings } = useContent();
  const { contact, pricing } = content.settings;

  const patchContact = (patch: Partial<typeof contact>) =>
    void updateSettings((settings) => ({
      ...settings,
      contact: { ...settings.contact, ...patch },
    }));

  return (
    <AdminPane
      title="بيانات التواصل"
      subtitle="تظهر في صفحة التواصل والفوتر، ورقم الواتساب هو وجهة كل الطلبات."
    >
      <FieldRow>
        <DebouncedText
          label="رقم واتساب"
          value={contact.whatsapp}
          dir="ltr"
          className="ltr-num"
          onCommit={(whatsapp) => patchContact({ whatsapp })}
        />
        <DebouncedText
          label="رقم الهاتف"
          value={contact.phone}
          dir="ltr"
          className="ltr-num"
          onCommit={(phone) => patchContact({ phone })}
        />
      </FieldRow>

      <p className="mb-4 text-[11.5px] text-soft">
        الروابط تُبنى بالصيغة الدولية تلقائيًا:{" "}
        <span className="ltr-num">
          wa.me/{normalizeWhatsappNumber(contact.whatsapp) || "—"}
        </span>
      </p>

      <FieldRow>
        <DebouncedText
          label="العنوان"
          value={contact.address}
          onCommit={(address) => patchContact({ address })}
        />
        <DebouncedText
          label="ساعات العمل"
          value={contact.hours}
          onCommit={(hours) => patchContact({ hours })}
        />
      </FieldRow>

      <FieldRow>
        <DebouncedText
          label="فيسبوك"
          value={contact.facebook}
          dir="ltr"
          className="ltr-num"
          onCommit={(facebook) => patchContact({ facebook })}
        />
        <DebouncedText
          label="إنستجرام"
          value={contact.instagram}
          dir="ltr"
          className="ltr-num"
          onCommit={(instagram) => patchContact({ instagram })}
        />
      </FieldRow>

      <DebouncedText
        label="عملة الأسعار"
        value={pricing.currency}
        dir="ltr"
        className="ltr-num"
        onCommit={(currency) =>
          void updateSettings((settings) => ({
            ...settings,
            pricing: { ...settings.pricing, currency },
          }))
        }
      />
    </AdminPane>
  );
}
