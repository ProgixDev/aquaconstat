import type { Metadata } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import { MotionProvider } from "@/components/motion";
import { site } from "@/core/site";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  // Fail-closed until the real domain is configured — see site.isPublic.
  alternates: site.isPublic ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: site.url,
    locale: site.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: site.isPublic ? { index: true, follow: true } : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured data (JSON-LD) so Google understands who we are, what we sell,
  // and where — Organization + WebSite + the priced Service, linked by @id.
  const orgId = `${site.url}/#organization`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: site.name,
        url: site.url,
        logo: `${site.url}/droplet.png`,
        email: "support@olala-degatdeseaux.fr",
        description: site.description,
        areaServed: { "@type": "Country", name: "France" },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "support@olala-degatdeseaux.fr",
          availableLanguage: ["French"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        url: site.url,
        description: site.description,
        inLanguage: "fr-FR",
        publisher: { "@id": orgId },
      },
      {
        "@type": "Service",
        "@id": `${site.url}/#service`,
        name: "Devis dégât des eaux à distance",
        serviceType: "Devis de travaux de rénovation après dégât des eaux",
        provider: { "@id": orgId },
        areaServed: { "@type": "Country", name: "France" },
        description:
          "Chiffrage à distance des travaux de remise en état après un dégât des eaux : à partir de vos photos et de votre description, un professionnel établit sous 48 h ouvrées un devis détaillé à transmettre à votre assurance.",
        offers: {
          "@type": "Offer",
          price: "82.90",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: site.url,
        },
      },
    ],
  };

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${nunito.variable} ${playfair.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          // JSON-LD is static, app-controlled data — safe to inline.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
