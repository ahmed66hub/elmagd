"use client";

import { useContent } from "@/components/providers";
import { ServiceRow } from "@/components/site/service-row";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, SectionLead, Wrap } from "@/components/ui/section";
import { PAGE_ROUTES } from "@/lib/config/site";

export function ServicesView() {
  const { content } = useContent();

  return (
    <Section>
      <Wrap>
        <SectionLead
          kicker="SERVICES"
          title={content.settings.labels.services}
          text="اختر الخدمة وابعت التفاصيل — يوصلك السعر والمدة في نفس اليوم."
        />
        <Card>
          {content.services.map((service, index) => (
            <ServiceRow key={service.id} service={service} index={index} />
          ))}
        </Card>
        <div className="mt-5">
          <ButtonLink href={PAGE_ROUTES.contact}>اطلب عرض سعر</ButtonLink>
        </div>
      </Wrap>
    </Section>
  );
}
