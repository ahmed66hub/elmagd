"use client";

import { useContent } from "@/components/providers";
import { ContactForm } from "@/components/site/contact-form";
import { ButtonLink } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/ui/icons";
import { Section, SectionLead, Wrap } from "@/components/ui/section";
import { SpecTable } from "@/components/ui/spec-table";
import { buildGeneralMessage, buildWhatsappLink } from "@/lib/domain/whatsapp";

export function ContactView() {
  const { content } = useContent();
  const { contact, brand, labels } = content.settings;

  const whatsappHref = buildWhatsappLink(
    contact.whatsapp,
    buildGeneralMessage(brand.name),
  );

  return (
    <Section>
      <Wrap>
        <SectionLead
          kicker="CONTACT"
          title={labels.contact}
          text="ابعت الملف أو الفكرة، ويوصلك السعر والمدة في نفس اليوم."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <ContactForm />

          <div>
            <SpecTable
              rows={[
                { label: "واتساب", value: contact.whatsapp },
                { label: "الهاتف", value: contact.phone },
                { label: "العنوان", value: contact.address, arabic: true },
                { label: "ساعات العمل", value: contact.hours, arabic: true },
                { label: "فيسبوك", value: contact.facebook },
                { label: "إنستجرام", value: contact.instagram },
              ]}
            />

            <div className="mt-4">
              <ButtonLink href={whatsappHref} external>
                <WhatsappIcon className="size-4" />
                افتح محادثة واتساب مباشرة
              </ButtonLink>
            </div>
          </div>
        </div>
      </Wrap>
    </Section>
  );
}
