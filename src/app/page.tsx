import type { Metadata } from "next";
import { Reveal } from "@/components/ui/reveal";
import {
  AboutSection,
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
        {/* « Engagement vert » raised directly under the hero + CTA (client
            feedback, 2026-07-17): the eco argument is a major selling point and
            must land as the first thing after the hero, not deep in the page. */}
        <Reveal>
          <EcoSection />
        </Reveal>
        <Reveal>
          <AudienceSection />
        </Reveal>
        {/* « Qui sommes-nous ? » (client, 2026-07-22) — who it is for, then who
            we are, then how it works. */}
        <Reveal>
          <AboutSection />
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
