"use client";

import { useContent } from "@/components/providers";
import { WorkGallery } from "@/components/site/work-gallery";
import { Section, SectionLead, Wrap } from "@/components/ui/section";

export function WorkView() {
  const { content } = useContent();

  return (
    <Section>
      <Wrap>
        <SectionLead
          kicker="PORTFOLIO"
          title={content.settings.labels.work}
          text="كل الصور والبيانات هنا تُدار من لوحة التحكم."
        />
        <WorkGallery works={content.works} />
      </Wrap>
    </Section>
  );
}
