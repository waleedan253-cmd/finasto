import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopHero } from "@/components/shop/shop-hero";
import { ShopPageClient } from "@/components/shop/shop-page-client";
import { SiteHeader } from "@/components/layout/site-header";
import { ShopIntro } from "@/components/shop/shop-intro";
import { SiteFooter } from "@/components/home/site-footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";

export const metadata: Metadata = {
  title: "Shop — Finasto Botanical Tea",
  description:
    "Browse Finasto's premium Bali botanical wellness teas — Velora and Blue Moon, with more to come.",
};

export default function ShopPage() {
  return (
    <main className="flex-1 bg-cream-soft">
      <AnnouncementBar />
      <SiteHeader />

      <ShopHero />
      <ShopIntro />
      <Suspense fallback={null}>
        <ShopPageClient />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
