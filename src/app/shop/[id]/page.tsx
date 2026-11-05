import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getStorefrontProducts } from "@/lib/storefront-queries";
import { ProductDetail } from "@/components/shop/product-detail";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";


// /shop/<product id>
//
// Reuses getStorefrontProducts() so the detail page shows exactly the same
// price, offer, currency conversion and state as the shop card. Only active
// products are returned, so a disabled or draft product is a 404.

// cache() makes the metadata and the page share one query per request
const getProduct = cache(async (id: string) => {
  const products = await getStorefrontProducts();
  return products.find((p) => p.id === id);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return { title: "Product not found — Finasto", robots: { index: false } };
  }
  const title = `${product.name} — Finasto Botanical Tea`;
  const description =
    product.shortDescription || `${product.name} from Finasto, Bali botanical tea.`;
  return {
    title,
    description,
    alternates: { canonical: `/shop/${product.id}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.image,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability:
        product.state === "out-of-stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      ...(product.offerEndsAt ? { priceValidUntil: product.offerEndsAt } : {}),
    },
  };

  return (
    <main className="flex-1 bg-pattern">
      <AnnouncementBar />
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetail product={product} />
  
      <SiteFooter />
    </main>
  );
}
