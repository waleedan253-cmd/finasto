import { HeroSection } from "@/components/home/hero-section";
import { TrustStrip } from "@/components/home/trust-strip";
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
      </main>
    </>
  );
}
