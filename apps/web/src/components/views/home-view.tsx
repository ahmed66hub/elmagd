"use client";

import { useContent } from "@/components/providers";
import { ServiceRow } from "@/components/site/service-row";
import { WorkCard } from "@/components/site/work-card";
import { PrinterStage } from "@/components/three/printer-stage";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, SectionLead, Wrap } from "@/components/ui/section";
import { SpecTable } from "@/components/ui/spec-table";
import { PAGE_ROUTES } from "@/lib/config/site";

export function HomeView() {
  const { content } = useContent();
  const { settings, services, works } = content;

  const topServices = services.slice(0, 4);
  const topWorks = works.slice(0, 3);

  return (
    <>
      <section className="animate-[var(--animate-fade-up)] pt-10 pb-14">
        <Wrap className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-edge-2 bg-card px-3.5 py-1.5 text-[12.5px]">
              <i className="size-1.75 animate-[var(--animate-led)] rounded-full bg-ok" />
              {settings.hero.pillText}
            </span>

            <h1 className="text-[clamp(32px,4.9vw,52px)] leading-[1.2] font-extrabold tracking-[-1px]">
              {settings.hero.title}{" "}
              <em className="text-brand not-italic">{settings.hero.highlight}</em>
            </h1>

            <p className="my-5 max-w-[44ch] text-[17px]">{settings.hero.text}</p>

            <div className="flex flex-wrap gap-2.5">
              <ButtonLink href={PAGE_ROUTES.viewer}>{settings.hero.ctaMain}</ButtonLink>
              <ButtonLink href={PAGE_ROUTES.work} variant="outline">
                {settings.hero.ctaAlt}
              </ButtonLink>
            </div>

            <div className="mt-8 grid overflow-hidden rounded-card border border-edge bg-card sm:grid-cols-3">
              {settings.hero.stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={
                    index === 0
                      ? "px-4.5 py-4"
                      : "border-t border-edge px-4.5 py-4 sm:border-t-0 sm:border-s sm:border-s-edge"
                  }
                >
                  <b className="ltr-num block text-[17px] text-ink">{stat.value}</b>
                  <span className="text-xs text-soft">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <PrinterStage />
        </Wrap>
      </section>

      <Section>
        <Wrap>
          <SectionLead
            kicker="SERVICES"
            title="أبرز الخدمات"
            text="كل خدمة لها سعر يبدأ من، والعميل يعرف موقعه قبل أن يسأل."
          />
          <Card>
            {topServices.map((service, index) => (
              <ServiceRow key={service.id} service={service} index={index} />
            ))}
          </Card>
          <div className="mt-4">
            <ButtonLink href={PAGE_ROUTES.services} variant="outline" size="sm">
              كل الخدمات
            </ButtonLink>
          </div>
        </Wrap>
      </Section>

      <Section className="pt-0">
        <Wrap>
          <SectionLead kicker="PORTFOLIO" title="أعمال مختارة" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
          <div className="mt-4">
            <ButtonLink href={PAGE_ROUTES.work} variant="outline" size="sm">
              المعرض كامل
            </ButtonLink>
          </div>
        </Wrap>
      </Section>

      <Section className="pt-0">
        <Wrap className="grid items-start gap-4 lg:grid-cols-2">
          <div>
            <SectionLead
              kicker="THE MACHINE"
              title={settings.about.title}
              text={settings.about.text}
            />
            <ButtonLink href={PAGE_ROUTES.viewer} size="sm">
              ارفع ملفك واعرف السعر
            </ButtonLink>
          </div>
          <SpecTable rows={settings.about.specs} />
        </Wrap>
      </Section>
    </>
  );
}
