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
  SocialProofSection,
  ReassuranceSection,
} from "@/features/landing";

export const metadata: Metadata = {
  title: "Devis dégât des eaux à distance",
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
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
          <SocialProofSection />
        </Reveal>
        <Reveal>
          <PricingSection />
        </Reveal>
        <Reveal>
          <ReassuranceSection />
        </Reveal>
        <Reveal>
          <FaqSection />
        </Reveal>
        <Reveal>
          <FinalCtaSection />
        </Reveal>
      </main>
      <SiteFooter />
    </>
  );
}
