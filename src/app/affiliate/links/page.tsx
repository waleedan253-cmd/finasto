import type { Metadata } from "next";
import {
  listLinkableProducts,
  listMyLinks,
} from "@/lib/affiliate/links-queries";
import { LinksTable } from "@/components/affiliate/links/links-table";

// Server component: reads the data, then hands it to the client table.
// Both queries call requireRole("affiliate") themselves, so the page is
// protected even if the route group's layout check were ever removed.

export const metadata: Metadata = {
  title: "Referral links",
};

export default async function AffiliateLinksPage() {
  // Independent reads, so run them together.
  const [links, products] = await Promise.all([
    listMyLinks(),
    listLinkableProducts(),
  ]);

  return (
    <div>
      <h1 className="font-display text-[28px] leading-tight text-espresso">
        Referral links
      </h1>
      <p className="mt-2 mb-6 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
        Share a link for any product. Orders placed through it are credited to
        you.
      </p>

      <LinksTable links={links} products={products} />
    </div>
  );
}
