import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection } from "@/components/shop/policy-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply when you browse and buy from the Finasto store.",
};

// EDIT BEFORE LAUNCH: replace the governing law and the company name with
// your real ones, and have the final text reviewed by a lawyer.
const UPDATED = "October 2026";

const list = "list-disc space-y-1.5 pl-5 marker:text-copper";
const link = "font-medium text-copper underline-offset-4 hover:underline";

export default function TermsPage() {
  return (
    <PolicyPage
      path="/terms"
      eyebrow="Legal"
      title="Terms of Service"
      intro="By using this website or placing an order, you agree to these terms. Please read them, and contact us if anything is unclear."
      updated={UPDATED}
    >
      <PolicySection id="using" title="Using the store">
        <ul className={list}>
          <li>You must be 18 or older, or have a parent or guardian&apos;s permission, to place an order.</li>
          <li>Give accurate information and keep your account password private.</li>
          <li>Do not misuse the site, attempt to disrupt it, or use it for anything unlawful.</li>
        </ul>
      </PolicySection>

      <PolicySection id="orders" title="Orders and prices">
        <p>
          An order is a request to buy. It is accepted when we confirm it by
          email, and we may decline or cancel an order, for example for stock
          errors, pricing mistakes or suspected fraud. If we cancel a paid
          order, you receive a full refund.
        </p>
        <p>
          Prices are shown in your selected currency and may change at any time.
          Taxes and shipping are shown at checkout. Prices in other currencies
          are approximate, and the amount charged is the one shown at payment.
        </p>
      </PolicySection>

      <PolicySection id="delivery-returns" title="Delivery and returns">
        <p>
          Delivery times and costs are described on our{" "}
          <Link href="/shipping" className={link}>
            Shipping & Delivery
          </Link>{" "}
          page, and returns and refunds on our{" "}
          <Link href="/returns" className={link}>
            Returns & Refunds
          </Link>{" "}
          page. Both are part of these terms.
        </p>
      </PolicySection>

      <PolicySection id="affiliates" title="Affiliate programme">
        <p>
          Affiliates earn commission under the rate and rules shown in their
          account. Commission is paid on eligible orders after the refund
          window, and it is reduced or reversed for refunded or cancelled
          orders. We may pause or end an affiliate account that breaks these
          terms.
        </p>
      </PolicySection>

      <PolicySection id="ip" title="Intellectual property">
        <p>
          The Finasto name, logo, images and website content belong to us or our
          licensors. You may not copy or use them commercially without our
          written permission.
        </p>
      </PolicySection>

      <PolicySection id="liability" title="Liability">
        <p>
          Our products are food and drink. Please check the ingredients before
          you consume them. To the fullest extent the law allows, we are not
          liable for indirect or consequential losses, and our total liability
          for an order is limited to the amount you paid for it. Nothing in
          these terms limits your legal rights as a consumer, or liability that
          cannot be limited by law.
        </p>
      </PolicySection>

      <PolicySection id="law" title="Governing law">
        <p>
          These terms are governed by the laws of Indonesia, unless your local
          consumer law requires otherwise. Disputes are handled by the courts
          of that country, and we encourage you to contact us first so we can
          resolve it.
        </p>
      </PolicySection>

      <PolicySection id="changes" title="Changes and contact">
        <p>
          We may update these terms and will change the date at the top when we
          do. Using the store after a change means you accept it. Questions?{" "}
          <Link href="/contact" className={link}>
            Contact us
          </Link>{" "}
          or read our{" "}
          <Link href="/privacy-policy" className={link}>
            Privacy Policy
          </Link>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}