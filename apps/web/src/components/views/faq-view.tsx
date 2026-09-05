"use client";

import { useContent } from "@/components/providers";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { Section, SectionLead, Wrap } from "@/components/ui/section";

export function FaqView() {
  const { content } = useContent();

  return (
    <Section>
      <Wrap>
        <SectionLead kicker="FAQ" title={content.settings.labels.faq} />
        <FaqAccordion items={content.faq} />
      </Wrap>
    </Section>
  );
}
