import type { Metadata } from "next";
import { Reveal } from "@/components/ui/reveal";
import {
  AudienceSection,
  DeliverableSection,
  EcoSection,
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
          <EcoSection />
        </Reveal>
        <Reveal>
          <PhotoGuideSection />
        </Reveal>
        <Reveal>
          <DeliverableSection />
        </Reveal>
        {/* Objections before price (client feedback, 2026-07-16): réassurance
            answers « avant de payer » doubts, so it must precede Tarif. */}
        <Reveal>
          <SocialProofSection />
        </Reveal>
        <Reveal>
          <ReassuranceSection />
        </Reveal>
        <Reveal>
          <PricingSection />
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
