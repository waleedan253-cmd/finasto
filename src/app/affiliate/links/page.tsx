import type { Metadata } from "next";
import { getMyReferralLink } from "@/lib/affiliate/referral-link-queries";
import { ReferralLinkCard } from "@/components/affiliate/links/referral-link-card";

// Server component: reads the affiliate's one link, then hands it to the
// client card. getMyReferralLink() calls requireRole("affiliate") itself,
// so the page is protected even if the layout check were ever removed.

export const metadata: Metadata = {
  title: "Referral link",
};

export default async function AffiliateLinksPage() {
  const link = await getMyReferralLink();

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-6 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
        Copy your link and share it. Orders placed through it are credited to
        you.
      </p>

      {link ? (
        <ReferralLinkCard link={link} />
      ) : (
        <div className="rounded-2xl border border-border-strong bg-white px-6 py-10 text-center font-sans text-[14px] text-warm-gray shadow-[0_1px_2px_rgba(50,30,24,0.06)] dark:border-border dark:shadow-none">
          Your referral link isn&apos;t ready yet. Please contact support.
        </div>
      )}
    </div>
  );
}
