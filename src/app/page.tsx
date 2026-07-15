import type { Metadata } from "next";
import { Reveal } from "@/components/ui/reveal";
import {
  AudienceSection,
  DeliverableSection,
  FaqSection,
  FinalCtaSection,
  Hero,
  HowItWorksSection,
  PhotoGuideSection,
  PricingSection,
  SiteFooter,
  SiteHeader,
  TestimonialsSection,
} from "@/features/landing";

export const metadata: Metadata = {
  title: "Devis dégât des eaux à distance",
};

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4.5 px-3 pt-4 pb-6 md:px-7">
      <SiteHeader />
      <main className="flex flex-col gap-4.5">
        <Hero />
        <Reveal>
          <AudienceSection />
        </Reveal>
        <Reveal>
          <HowItWorksSection />
        </Reveal>
        <Reveal>
          <PhotoGuideSection />
        </Reveal>
        <Reveal>
          <DeliverableSection />
        </Reveal>
        <Reveal>
          <PricingSection />
        </Reveal>
        <Reveal>
          <TestimonialsSection />
        </Reveal>
        <Reveal>
          <FaqSection />
        </Reveal>
        <Reveal>
          <FinalCtaSection />
        </Reveal>
      </main>
      <Reveal>
        <SiteFooter />
      </Reveal>
    </div>
  );
}
