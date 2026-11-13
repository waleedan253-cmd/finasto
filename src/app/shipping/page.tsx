// import type { Metadata } from "next";
// import Link from "next/link";
// import { Clock, PackageCheck, Truck, type LucideIcon } from "lucide-react";
// import { PolicyPage, PolicySection } from "@/components/shop/policy-page";

// export const metadata: Metadata = {
//   title: "Shipping & Delivery",
//   description:
//     "How Finasto ships your coffee and tea: processing time, delivery times and costs by region, tracking, and customs.",
// };

// // EDIT BEFORE LAUNCH: these numbers are placeholders. Replace them with
// // your real processing time, delivery times and prices.
// const UPDATED = "October 2026";

// const highlights: { icon: LucideIcon; title: string; text: string }[] = [
//   {
//     icon: Clock,
//     title: "Fast processing",
//     text: "Orders are packed within 1 to 3 business days.",
//   },
//   {
//     icon: Truck,
//     title: "Worldwide delivery",
//     text: "We ship from Bali to customers around the world.",
//   },
//   {
//     icon: PackageCheck,
//     title: "Tracked orders",
//     text: "Follow your order from our door to yours.",
//   },
// ];

// const rates = [
//   { region: "Indonesia", time: "2 to 5 business days", cost: "From Rp 20,000" },
//   { region: "Pakistan", time: "7 to 14 business days", cost: "From Rs 1,500" },
//   { region: "Rest of the world", time: "10 to 21 business days", cost: "From $15" },
// ];

// export default function ShippingPage() {
//   return (
//     <PolicyPage
//       path="/shipping"
//       eyebrow="Shipping"
//       title="Shipping & Delivery"
//       intro="Every order is packed fresh in small batches and sent from Bali. Here is what to expect from checkout to your door."
//       updated={UPDATED}
//     >
//       <ul className="grid gap-4 sm:grid-cols-3">
//         {highlights.map(({ icon: Icon, title, text }) => (
//           <li key={title} className="finasto-card p-5">
//             <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-copper/10 text-copper">
//               <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
//             </span>
//             <h2 className="mt-4 font-sans  text-[15px] font-semibold text-espresso">
//               {title}
//             </h2>
//             <p className="mt-1 font-sans text-[13px] leading-relaxed text-warm-gray">
//               {text}
//             </p>
//           </li>
//         ))}
//       </ul>

//       <PolicySection id="processing" title="Processing time">
//         <p>
//           Orders are processed within 1 to 3 business days after payment is
//           confirmed. Business days are Monday to Friday, excluding public
//           holidays in Indonesia. Orders placed on a weekend or holiday are
//           processed the next business day.
//         </p>
//         <p>
//           You receive an email when your order is confirmed, and another when
//           it ships.
//         </p>
//       </PolicySection>

//       <PolicySection id="rates" title="Delivery times and costs">
//         <p>
//           Delivery time starts when your order ships, not when you place it.
//           The exact shipping cost is shown at checkout before you pay.
//         </p>
//         <div className="finasto-card overflow-x-auto">
//           <table className="w-full min-w-[480px] border-collapse text-left font-sans text-[14px]">
//             <thead>
//               <tr className="bg-espresso/5 text-espresso">
//                 <th scope="col" className="px-4 py-3 font-semibold">
//                   Destination
//                 </th>
//                 <th scope="col" className="px-4 py-3 font-semibold">
//                   Estimated delivery
//                 </th>
//                 <th scope="col" className="px-4 py-3 font-semibold">
//                   Shipping cost
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {rates.map((row) => (
//                 <tr key={row.region} className="border-t border-border">
//                   <th
//                     scope="row"
//                     className="px-4 py-3 font-medium text-espresso"
//                   >
//                     {row.region}
//                   </th>
//                   <td className="px-4 py-3">{row.time}</td>
//                   <td className="px-4 py-3">{row.cost}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <p className="text-[13px]">
//           Times are estimates and can change with customs, weather and
//           carrier delays.
//         </p>
//       </PolicySection>

//       <PolicySection id="tracking" title="Tracking your order">
//         <p>
//           When your order ships, we email you a tracking number and a link.
//           Tracking can take up to 48 hours to show movement after the first
//           scan. If you ordered with an account, you can also see the status of
//           your order there.
//         </p>
//       </PolicySection>

//       <PolicySection id="customs" title="Customs, duties and taxes">
//         <p>
//           Orders sent to another country may be charged import duties, taxes or
//           customs fees by that country. These charges are set by local
//           authorities, are not included in our prices or shipping cost, and
//           are the responsibility of the buyer.
//         </p>
//         <p>
//           Please check your country&apos;s rules for importing food and drink
//           products before you order.
//         </p>
//       </PolicySection>

//       <PolicySection id="problems" title="Delays, lost or damaged parcels">
//         <p>
//           If your parcel is late, lost, or arrives damaged, contact us within
//           14 days of the expected delivery date with your order number and, for
//           damage, a photo of the parcel and the product. We will work with the
//           carrier and either resend your order or refund it.
//         </p>
//         <p>
//           Please make sure your delivery address and phone number are correct
//           at checkout. We cannot change them after an order has shipped.
//         </p>
//       </PolicySection>

//       <PolicySection id="help" title="Questions?">
//         <p>
//           See our{" "}
//           <Link
//             href="/faq"
//             className="font-medium text-copper underline-offset-4 hover:underline"
//           >
//             FAQ
//           </Link>
//           , our{" "}
//           <Link
//             href="/returns"
//             className="font-medium text-copper underline-offset-4 hover:underline"
//           >
//             Returns & Refunds
//           </Link>{" "}
//           policy, or{" "}
//           <Link
//             href="/contact"
//             className="font-medium text-copper underline-offset-4 hover:underline"
//           >
//             contact us
//           </Link>
//           .
//         </p>
//       </PolicySection>
//     </PolicyPage>
//   );
// }


  import type { Metadata } from "next";
import Link from "next/link";
import {
  Camera,
  Clock,
  FileText,
  Globe2,
  Hash,
  MailCheck,
  MapPin,
  PackageCheck,
  PackageOpen,
  Search,
  ShieldAlert,
  Truck,
  type LucideIcon,
} from "lucide-react";
import {
  PolicyPage,
  PolicySection,
  AnimatedCard,
  GlowIcon,
} from "@/components/shop/policy-page";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description:
    "How FINASTO™ ships your coffee and tea from Indonesia: processing time, delivery times, tracking, customs and what to do if something goes wrong.",
};

const UPDATED = "November 2026";

// Change this if your Track Order page uses a different address.
const TRACK_ORDER_HREF = "/track-order";

type Item = { icon: LucideIcon; title: string; text: string };

const highlights: Item[] = [
  {
    icon: Clock,
    title: "Fast processing",
    text: "Orders are typically processed within 1–3 business days.",
  },
  {
    icon: Truck,
    title: "Worldwide delivery",
    text: "Shipped from Indonesia to supported destinations around the world.",
  },
  {
    icon: PackageCheck,
    title: "Tracked orders",
    text: "Follow your parcel with a tracking number and link.",
  },
];

const journey: Item[] = [
  {
    icon: MailCheck,
    title: "Order confirmed",
    text: "You receive a confirmation email after purchase.",
  },
  {
    icon: PackageOpen,
    title: "Processing",
    text: "Packed within 1–3 business days.",
  },
  {
    icon: Truck,
    title: "Dispatched",
    text: "A shipping email with your tracking link is sent.",
  },
  {
    icon: PackageCheck,
    title: "Delivered",
    text: "Delivery time counts from the dispatch date.",
  },
];

const destinations: {
  icon: LucideIcon;
  name: string;
  days: string;
  note: string;
}[] = [
  {
    icon: MapPin,
    name: "Indonesia",
    days: "2–5",
    note: "Domestic delivery",
  },
  {
    icon: Globe2,
    name: "Rest of the World",
    days: "10–21",
    note: "International delivery to supported destinations",
  },
];

const damageChecklist: Item[] = [
  {
    icon: Hash,
    title: "Your order number",
    text: "So we can find your shipment quickly.",
  },
  {
    icon: FileText,
    title: "Relevant details",
    text: "Anything that helps us understand what happened.",
  },
  {
    icon: Camera,
    title: "Photos if damaged",
    text: "Of the packaging and the affected products.",
  },
];

const linkClass =
  "font-medium text-copper underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

const ROUTE_PATH = "M60 105 C 200 -10, 400 -10, 540 105";

function Callout({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex gap-4 overflow-hidden rounded-2xl border border-copper/30 bg-green-bg p-5 pl-6">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-copper-light to-copper"
      />
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-copper/40 bg-cream text-copper">
        <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
      </span>
      <div className="text-[14px] leading-relaxed">{children}</div>
    </div>
  );
}

export default function ShippingPage() {
  return (
    <PolicyPage
      path="/shipping"
      eyebrow="Shipping delivery"
      title="Shipping & Delivery"
      intro="FINASTO™ orders are carefully prepared and shipped from Indonesia. Here’s what to expect from checkout to delivery."
      updated={UPDATED}
    >
      {/* Highlights */}
      <ul className="grid gap-4 sm:grid-cols-3">
        {highlights.map(({ icon: Icon, title, text }) => (
          <AnimatedCard
            as="li"
            key={title}
            delay={ 0.1}
            className="finasto-card relative overflow-hidden p-6 pt-7"
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-copper via-copper-light to-copper"
            />
            <GlowIcon className="h-12 w-12 bg-gradient-to-br from-green-deep to-green text-cream ring-2 ring-copper/50 ring-offset-2 ring-offset-cream">
              <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </GlowIcon>
            <h2 className="mt-5 font-sans text-[16px] font-semibold text-espresso">
              {title}
            </h2>
            <p className="mt-1.5 font-sans text-[13.5px] leading-relaxed text-warm-gray">
              {text}
            </p>
         </AnimatedCard>
        ))}
      </ul>

      {/* Order journey */}
      <div className="finasto-card p-6 sm:p-8">
        <h2 className="font-display text-[24px] leading-tight text-espresso">
          From checkout to your door
        </h2>
        <ol aria-label="Order journey" className="relative mt-8 grid gap-8 lg:grid-cols-4 lg:gap-6">
          {/* Desktop connector */}
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-[22px] hidden border-t border-dashed border-copper/60 lg:block"
          />
          {journey.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className="relative pl-16 before:absolute before:left-[21px] before:top-12 before:h-[calc(100%-1rem)] before:w-px before:bg-copper/40 last:before:hidden lg:pl-0 lg:text-center lg:before:hidden"
            >
              <span className="absolute left-0 top-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-copper/50 bg-cream text-green-deep shadow-[0_8px_18px_-10px_rgba(35,77,42,0.6)] lg:static lg:mx-auto">
                <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
                <span
                  aria-hidden="true"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-copper font-sans text-[11px] font-semibold text-white"
                >
                  {i + 1}
                </span>
              </span>
              <h3 className="font-sans text-[15px] font-semibold text-espresso lg:mt-4">
                {title}
              </h3>
              <p className="mt-1 font-sans text-[13.5px] leading-relaxed text-warm-gray">
                {text}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <PolicySection id="processing" title="Order Processing Time">
        <p>
          Orders are typically processed within 1–3 business days after payment
          has been confirmed.
        </p>
        <p>
          Business days are Monday to Friday, excluding Indonesian public
          holidays. Orders placed on weekends or public holidays are processed
          on the next business day.
        </p>
        <p>
          You will receive an order confirmation email after your purchase and
          a shipping confirmation email once your order has been dispatched.
        </p>
      </PolicySection>

      <PolicySection id="destinations" title="Delivery Destinations">
        <p>
          FINASTO™ offers domestic delivery within Indonesia and international
          shipping to supported destinations.
        </p>
        <p>
          International delivery availability depends on destination-country
          regulations, courier coverage and applicable import restrictions.
        </p>
      </PolicySection>

      <PolicySection id="rates" title="Estimated Delivery Times & Shipping Costs">
        <p>
          Delivery estimates begin from the date your order is dispatched, not
          the date of purchase.
        </p>

        {/* Delivery times panel */}
        <div className="relative overflow-hidden rounded-3xl border border-copper/40 bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] text-white shadow-[0_30px_60px_-30px_rgba(16,38,15,0.85)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-copper/20 blur-3xl"
          />

          {/* Route */}
          <div className="relative px-6 pt-8 sm:px-10">
            <svg
              viewBox="0 0 600 140"
              role="img"
              aria-label="Shipping route from Indonesia to destinations worldwide"
              className="mx-auto h-auto w-full max-w-xl"
            >
              <path
                d={ROUTE_PATH}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="2 8"
                strokeLinecap="round"
                className="text-copper-light"
              />
              <circle cx="60" cy="105" r="11" className="fill-copper-light/25" />
              <circle cx="60" cy="105" r="6" className="fill-copper-light" />
              <circle cx="540" cy="105" r="11" className="fill-cream/20" />
              <circle cx="540" cy="105" r="6" className="fill-cream" />
              <circle r="5" className="fill-cream motion-reduce:hidden">
                <animateMotion
                  dur="5s"
                  repeatCount="indefinite"
                  path={ROUTE_PATH}
                />
              </circle>
              <text
                x="60"
                y="132"
                textAnchor="middle"
                className="fill-white/80 font-sans text-[13px]"
              >
                Indonesia
              </text>
              <text
                x="540"
                y="132"
                textAnchor="middle"
                className="fill-white/80 font-sans text-[13px]"
              >
                Your door
              </text>
            </svg>
          </div>

          {/* Times */}
          <ul className="relative mt-4 grid border-t border-white/15 sm:grid-cols-2 sm:divide-x sm:divide-white/15">
            {destinations.map(({ icon: Icon, name, days, note }) => (
              <li
                key={name}
                className="p-6 not-first:border-t not-first:border-white/15 sm:p-8 sm:not-first:border-t-0"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cream to-copper-light text-green-deep">
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>
                  <h3 className="font-sans text-[16px] font-medium text-copper-light">
                    {name}
                  </h3>
                </div>
                <p className="mt-5 font-display text-[56px] leading-none">
                  {days}
                  <span className="ml-2 font-sans text-[14px] font-normal text-white/75">
                    business days
                  </span>
                </p>
                <p className="mt-3 font-sans text-[13.5px] leading-relaxed text-white/70">
                  {note}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <p>
          Delivery times are estimates and may vary depending on the
          destination, customs clearance, weather conditions and courier
          operations.
        </p>
        <p>
          Shipping costs depend on the destination, package weight and
          available shipping service. The applicable shipping cost will be
          displayed at checkout before payment is completed.
        </p>
      </PolicySection>

      <PolicySection id="tracking" title="Tracking Your Order">
        <p>
          Once your order has been dispatched, we will send a shipping
          confirmation email containing your tracking number and tracking link.
        </p>
        <p>
          Tracking information may take up to 48 hours to display updates after
          the courier’s initial scan.
        </p>
        <p>You can also check your shipment status on our website.</p>
        <div>
          <Link
            href={TRACK_ORDER_HREF}
            className="inline-flex items-center gap-2 rounded-full border border-copper/60 bg-gradient-to-br from-green-deep to-green px-6 py-3 font-sans text-[14px] font-medium text-cream shadow-[0_12px_28px_-12px_rgba(35,77,42,0.9)] transition-colors duration-200 hover:from-green hover:to-green-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
          >
            <Search
              className="h-4 w-4 text-copper-light"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            Track your order
          </Link>
        </div>
      </PolicySection>

      <PolicySection id="customs" title="Customs Duties & Import Taxes">
        <p>
          International orders may be subject to customs duties, import taxes
          or other charges imposed by the destination country.
        </p>
        <p>
          Unless otherwise stated at checkout or required by applicable law,
          these charges are the responsibility of the customer.
        </p>
        <Callout icon={ShieldAlert}>
          <p>
            Please check your country’s import regulations before placing an
            order, to make sure FINASTO™ products can legally be imported into
            your destination.
          </p>
        </Callout>
      </PolicySection>

      <PolicySection id="problems" title="Delays, Lost or Damaged Parcels">
        <p>
          Delivery delays may occur due to circumstances such as customs
          inspections, weather conditions, public holidays or courier
          disruptions.
        </p>
        <p>
          If your order is delayed, appears to be lost or arrives damaged,
          please contact our team as soon as possible, providing your order
          number and relevant supporting information.
        </p>

        <ul className="grid gap-3 sm:grid-cols-3">
          {damageChecklist.map(({ icon: Icon, title, text }) => (
            <AnimatedCard
              as="li"
              key={title}
              className="rounded-2xl border border-copper/30 bg-green-bg p-4"
            >
              <GlowIcon className="h-9 w-9 bg-gradient-to-br from-green-deep to-green text-cream">
                <Icon
                  className="h-4 w-4"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </GlowIcon>
              <h3 className="mt-3 font-sans text-[14px] font-semibold text-espresso">
                {title}
              </h3>
              <p className="mt-1 font-sans text-[13px] leading-relaxed text-warm-gray">
                {text}
              </p>
           </AnimatedCard>
          ))}
        </ul>

        <p>
          For damaged parcels, photographs of the packaging and affected
          products may be requested to assist with the investigation.
        </p>
        <p>
          FINASTO™ will review reported issues and coordinate with the relevant
          shipping carrier where necessary. Following an investigation, an
          appropriate resolution, including replacement or refund where
          applicable, will be provided in accordance with applicable laws and
          consumer rights.
        </p>
      </PolicySection>

      <PolicySection
        id="address"
        title="Delivery Address & Customer Information"
      >
        <p>
          Customers are responsible for providing accurate and complete
          delivery information, including their full address, postal code and
          contact number, at checkout.
        </p>
        <Callout icon={MapPin}>
          <p>
            Please contact our team as soon as possible if you notice an error
            in your delivery details. Address changes cannot be guaranteed once
            an order has been dispatched.
          </p>
        </Callout>
        <p>
          Additional delivery attempts, redelivery charges or return shipping
          costs arising from incorrect or incomplete customer-provided
          information may be charged to the customer where permitted by
          applicable law and where the additional costs are attributable to the
          information provided.
        </p>
      </PolicySection>

      <PolicySection id="help" title="Questions?">
        <p>
          See our{" "}
          {/* <Link href="/faq" className={linkClass}>
            FAQ
          </Link>
          , our{" "} */}
          <Link href="/returns" className={linkClass}>
            Returns & Refunds
          </Link>{" "}
          policy, or{" "}
          <Link href="/contact" className={linkClass}>
            contact us
          </Link>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}