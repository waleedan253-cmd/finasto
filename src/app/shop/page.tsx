import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopHero } from "@/components/shop/shop-hero";
import { ShopPageClient } from "@/components/shop/shop-page-client";
import { SiteHeader } from "@/components/layout/site-header";
// import { ShopIntro } from "@/components/shop/shop-intro";
import { SiteFooter } from "@/components/home/site-footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { getStorefrontProducts } from "@/lib/storefront-queries";
import { OffersCarousel } from "@/components/shop/offers-carousel";

export const metadata: Metadata = {
  title: "Shop — Finasto Botanical Tea",
  description:
    "Browse Finasto's premium Bali botanical wellness teas — Velora and Blue Moon, with more to come.",
};

export default async function ShopPage() {
  const products = await getStorefrontProducts();
  return (
    <main className="flex-1 bg-pattern">
      <AnnouncementBar />
      <SiteHeader />
      <ShopHero />
      {/* <ShopIntro /> */}
<OffersCarousel products={products.filter((p) => p.state === "offer")} />
      <Suspense fallback={null}>
        <ShopPageClient products={products} />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
