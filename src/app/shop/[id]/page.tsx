import { notFound } from "next/navigation";
import { getStorefrontProducts } from "@/lib/storefront-queries";
import { ProductDetail } from "@/components/shop/product-detail";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { ShopPageClient } from "@/components/shop/shop-page-client";
import { Suspense } from "react";

// /shop/<product id>
//
// Reuses getStorefrontProducts() so the detail page shows exactly the same
// price, offer, currency conversion and state as the shop card. Only active
// products are returned, so a disabled or draft product is a 404.

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const products = await getStorefrontProducts();
  const product = products.find((p) => p.id === id);

  if (!product) notFound();

  return (
    <main className="flex-1 bg-cream-soft">
      <AnnouncementBar />
      <SiteHeader />
      <ProductDetail product={product} />
      <Suspense fallback={null}>
        <ShopPageClient products={products} />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
