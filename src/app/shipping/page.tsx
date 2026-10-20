import type { Metadata } from "next";
import Link from "next/link";
import { Clock, PackageCheck, Truck, type LucideIcon } from "lucide-react";
import { PolicyPage, PolicySection } from "@/components/shop/policy-page";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description:
    "How Finasto ships your coffee and tea: processing time, delivery times and costs by region, tracking, and customs.",
};

// EDIT BEFORE LAUNCH: these numbers are placeholders. Replace them with
// your real processing time, delivery times and prices.
const UPDATED = "October 2026";

const highlights: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Clock,
    title: "Fast processing",
    text: "Orders are packed within 1 to 3 business days.",
  },
  {
    icon: Truck,
    title: "Worldwide delivery",
    text: "We ship from Bali to customers around the world.",
  },
  {
    icon: PackageCheck,
    title: "Tracked orders",
    text: "Follow your order from our door to yours.",
  },
];

const rates = [
  { region: "Indonesia", time: "2 to 5 business days", cost: "From Rp 20,000" },
  { region: "Pakistan", time: "7 to 14 business days", cost: "From Rs 1,500" },
  { region: "Rest of the world", time: "10 to 21 business days", cost: "From $15" },
];

export default function ShippingPage() {
  return (
    <PolicyPage
      path="/shipping"
      eyebrow="Shipping"
      title="Shipping & Delivery"
      intro="Every order is packed fresh in small batches and sent from Bali. Here is what to expect from checkout to your door."
      updated={UPDATED}
    >
      <ul className="grid gap-4 sm:grid-cols-3">
        {highlights.map(({ icon: Icon, title, text }) => (
          <li key={title} className="finasto-card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-copper/10 text-copper">
              <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-sans text-[15px] font-semibold text-espresso">
              {title}
            </h2>
            <p className="mt-1 font-sans text-[13px] leading-relaxed text-warm-gray">
              {text}
            </p>
          </li>
        ))}
      </ul>

      <PolicySection id="processing" title="Processing time">
        <p>
          Orders are processed within 1 to 3 business days after payment is
          confirmed. Business days are Monday to Friday, excluding public
          holidays in Indonesia. Orders placed on a weekend or holiday are
          processed the next business day.
        </p>
        <p>
          You receive an email when your order is confirmed, and another when
          it ships.
        </p>
      </PolicySection>

      <PolicySection id="rates" title="Delivery times and costs">
        <p>
          Delivery time starts when your order ships, not when you place it.
          The exact shipping cost is shown at checkout before you pay.
        </p>
        <div className="finasto-card overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left font-sans text-[14px]">
            <thead>
              <tr className="bg-espresso/5 text-espresso">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Destination
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Estimated delivery
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Shipping cost
                </th>
              </tr>
            </thead>
            <tbody>
              {rates.map((row) => (
                <tr key={row.region} className="border-t border-border">
                  <th
                    scope="row"
                    className="px-4 py-3 font-medium text-espresso"
                  >
                    {row.region}
                  </th>
                  <td className="px-4 py-3">{row.time}</td>
                  <td className="px-4 py-3">{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[13px]">
          Times are estimates and can change with customs, weather and
          carrier delays.
        </p>
      </PolicySection>

      <PolicySection id="tracking" title="Tracking your order">
        <p>
          When your order ships, we email you a tracking number and a link.
          Tracking can take up to 48 hours to show movement after the first
          scan. If you ordered with an account, you can also see the status of
          your order there.
        </p>
      </PolicySection>

      <PolicySection id="customs" title="Customs, duties and taxes">
        <p>
          Orders sent to another country may be charged import duties, taxes or
          customs fees by that country. These charges are set by local
          authorities, are not included in our prices or shipping cost, and
          are the responsibility of the buyer.
        </p>
        <p>
          Please check your country&apos;s rules for importing food and drink
          products before you order.
        </p>
      </PolicySection>

      <PolicySection id="problems" title="Delays, lost or damaged parcels">
        <p>
          If your parcel is late, lost, or arrives damaged, contact us within
          14 days of the expected delivery date with your order number and, for
          damage, a photo of the parcel and the product. We will work with the
          carrier and either resend your order or refund it.
        </p>
        <p>
          Please make sure your delivery address and phone number are correct
          at checkout. We cannot change them after an order has shipped.
        </p>
      </PolicySection>

      <PolicySection id="help" title="Questions?">
        <p>
          See our{" "}
          <Link
            href="/faq"
            className="font-medium text-copper underline-offset-4 hover:underline"
          >
            FAQ
          </Link>
          , our{" "}
          <Link
            href="/returns"
            className="font-medium text-copper underline-offset-4 hover:underline"
          >
            Returns & Refunds
          </Link>{" "}
          policy, or{" "}
          <Link
            href="/contact"
            className="font-medium text-copper underline-offset-4 hover:underline"
          >
            contact us
          </Link>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}