import { BrandStory } from "@/components/home/brand-story";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { HeroSection } from "@/components/home/hero-section";
import { Newsletter } from "@/components/home/newsletter";
import { ProductPhilosophy } from "@/components/home/product-philosophy";
import { SiteFooter } from "@/components/home/site-footer";
import { TrustStrip } from "@/components/home/trust-strip";
import { WhyFinasto } from "@/components/home/why-finasto";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader cartCount={0} />
      <main className="flex-1 bg-cream">
        <HeroSection />
        <TrustStrip />
        <FeaturedCollection />
        <WhyFinasto />
        <BrandStory />
        <ProductPhilosophy />
        {/* <Newsletter /> */}
        <SiteFooter />
      </main>
    </>
  );
}
