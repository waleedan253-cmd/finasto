// import type { Metadata } from "next";
// import Link from "next/link";
// import { RotateCcw, ShieldCheck, Wallet, type LucideIcon } from "lucide-react";
// import { PolicyPage, PolicySection } from "@/components/shop/policy-page";

// export const metadata: Metadata = {
//   title: "Returns & Refunds",
//   description:
//     "Finasto's returns and refunds policy: what can be returned, how to start a return, damaged or wrong items, and when you get your refund.",
// };

// // EDIT BEFORE LAUNCH: the periods, conditions and who pays for return
// // shipping below are placeholders. Replace them with your real policy, and
// // check the consumer rules of the countries you sell to.
// const UPDATED = "October 2026";

// const highlights: { icon: LucideIcon; title: string; text: string }[] = [
//   {
//     icon: RotateCcw,
//     title: "14-day returns",
//     text: "Return unopened products within 14 days of delivery.",
//   },
//   {
//     icon: ShieldCheck,
//     title: "Damaged or wrong items",
//     text: "We replace or refund them, and we cover the shipping.",
//   },
//   {
//     icon: Wallet,
//     title: "Refund to your payment method",
//     text: "Refunds are issued within 5 to 10 business days.",
//   },
// ];

// const steps = [
//   {
//     title: "Contact us",
//     text: "Send your order number and the reason for the return within 14 days of delivery.",
//   },
//   {
//     title: "Get approval",
//     text: "We reply within 2 business days with a return address and instructions.",
//   },
//   {
//     title: "Send the parcel",
//     text: "Pack the products securely in their original packaging and ship them with tracking.",
//   },
//   {
//     title: "Receive your refund",
//     text: "We inspect the parcel and refund you once it arrives.",
//   },
// ];

// const link = "font-medium text-copper underline-offset-4 hover:underline";

// export default function ReturnsPage() {
//   return (
//     <PolicyPage
//       path="/returns"
//       eyebrow="Returns"
//       title="Returns & Refunds"
//       intro="We want you to love every cup. If something is not right, here is how we make it right."
//       updated={UPDATED}
//     >
//       <ul className="grid gap-4 sm:grid-cols-3">
//         {highlights.map(({ icon: Icon, title, text }) => (
//           <li key={title} className="finasto-card p-5">
//             <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-copper/10 text-copper">
//               <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
//             </span>
//             <h2 className="mt-4 font-sans text-[15px] font-semibold text-espresso">
//               {title}
//             </h2>
//             <p className="mt-1 font-sans text-[13px] leading-relaxed text-warm-gray">
//               {text}
//             </p>
//           </li>
//         ))}
//       </ul>

//       <PolicySection id="eligibility" title="What can be returned">
//         <p>
//           Because coffee and tea are food products, we can only accept returns
//           of items that are:
//         </p>
//         <ul className="list-disc space-y-1.5 pl-5 marker:text-copper">
//           <li>unopened, unused and in the original sealed packaging;</li>
//           <li>returned within 14 days of the delivery date; and</li>
//           <li>accompanied by your order number.</li>
//         </ul>
//         <p>
//           Opened products cannot be returned for hygiene and food-safety
//           reasons, unless they arrive damaged or are not what you ordered (see
//           below).
//         </p>
//       </PolicySection>

//       <PolicySection id="how" title="How to return an item">
//         <ol className="flex flex-col gap-4">
//           {steps.map((step, i) => (
//             <li key={step.title} className="flex items-start gap-3">
//               <span
//                 aria-hidden="true"
//                 className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-copper/40 bg-copper/10 font-display text-[15px] italic text-copper"
//               >
//                 {i + 1}
//               </span>
//               <div>
//                 <p className="font-sans text-[15px] font-semibold text-espresso">
//                   {step.title}
//                 </p>
//                 <p className="mt-0.5 text-[14px]">{step.text}</p>
//               </div>
//             </li>
//           ))}
//         </ol>
//       </PolicySection>

//       <PolicySection id="damaged" title="Damaged, wrong or missing items">
//         <p>
//           If your order arrives damaged, is not what you ordered, or an item is
//           missing, contact us within 7 days of delivery with your order number
//           and a clear photo of the parcel and the product. We will send a
//           replacement or refund you, and you do not need to send the product
//           back. We cover the cost.
//         </p>
//       </PolicySection>

//       <PolicySection id="refunds" title="When you get your refund">
//         <p>
//           After we receive and inspect your return, we email you to confirm. If
//           it is approved, the refund goes back to your original payment method
//           within 5 to 10 business days. Your bank or card provider may need
//           extra time to show it.
//         </p>
//         <p>
//           The original shipping cost is refunded only if the return is because
//           of our mistake or a damaged item. For other returns, the refund is
//           the product price.
//         </p>
//       </PolicySection>

//       <PolicySection id="shipping-costs" title="Return shipping costs">
//         <p>
//           If you return an item because you changed your mind, you pay the
//           return shipping and we recommend a tracked service, because we cannot
//           refund parcels that are lost on their way back to us. If the return
//           is our mistake, we pay.
//         </p>
//       </PolicySection>

//       <PolicySection id="cancel" title="Cancelling an order">
//         <p>
//           You can cancel an order before it ships by contacting us as soon as
//           possible. Once an order has shipped, it cannot be cancelled, but you
//           can return it under the rules above. See{" "}
//           <Link href="/shipping" className={link}>
//             Shipping & Delivery
//           </Link>{" "}
//           for processing times.
//         </p>
//       </PolicySection>

//       <PolicySection id="help" title="Need help?">
//         <p>
//           Read our{" "}
//           <Link href="/faq" className={link}>
//             FAQ
//           </Link>{" "}
//           or{" "}
//           <Link href="/contact" className={link}>
//             contact us
//           </Link>{" "}
//           and include your order number, so we can help faster.
//         </p>
//       </PolicySection>
//     </PolicyPage>
//   );
// }

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeftRight,
  CalendarX,
  Check,
  Clock,
  PackageMinus,
  PackageX,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  PolicyPage,
  PolicySection,
  AnimatedCard,
  GlowIcon,
} from "@/components/shop/policy-page";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "FINASTO™ returns and refunds policy: eligible claims, how to request a return or refund, reporting period, return shipping costs and order cancellations.",
};

const UPDATED = "November 2026";

type Item = { icon: LucideIcon; title: string; text: string };

const highlights: Item[] = [
  {
    icon: ShieldCheck,
    title: "Quality guaranteed",
    text: "Damaged, incorrect, defective, expired or missing items are reviewed and resolved.",
  },
  {
    icon: Clock,
    title: "Report within 2 business days",
    text: "Tell us about damaged, incorrect or missing items soon after delivery.",
  },
  {
    icon: Wallet,
    title: "Refund to original payment",
    text: "Approved refunds go back to the payment method you used.",
  },
];

const eligible: Item[] = [
  {
    icon: PackageX,
    title: "Damaged items",
    text: "Products arrive damaged.",
  },
  {
    icon: ArrowLeftRight,
    title: "Incorrect items",
    text: "Products received differ from those ordered.",
  },
  {
    icon: Wrench,
    title: "Defective products",
    text: "Products have a verified quality defect, including hidden defects.",
  },
  {
    icon: CalendarX,
    title: "Expired products",
    text: "Products arrive past their stated expiry date.",
  },
  {
    icon: PackageMinus,
    title: "Missing items",
    text: "One or more products from the order are missing.",
  },
];

const steps: { title: string; text: string }[] = [
  {
    title: "Contact us",
    text: "Contact our team with your order number and a clear description of the issue.",
  },
  {
    title: "Provide evidence",
    text: "Provide clear photographs and videos of the affected products and packaging where requested.",
  },
  {
    title: "Review & approval",
    text: "Our team will review your claim and may request additional information to verify the reported issue.",
  },
  {
    title: "Resolution",
    text: "Once the claim has been reviewed, FINASTO™ will arrange an appropriate resolution, which may include a replacement, exchange or refund, depending on the circumstances.",
  },
];

const conditions: string[] = [
  "A valid order number is required for all claims.",
  "Customers may be asked to provide photographs and videos to support their claims.",
  "Products and original packaging should be retained until the claim has been reviewed.",
  "Claims involving damage caused by customer misuse or improper handling may not qualify for a refund or replacement, where applicable.",
  "All claims are subject to verification.",
  "Nothing in this policy limits any customer rights that cannot legally be excluded.",
];

const linkClass =
  "font-medium text-copper underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

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

export default function ReturnsPage() {
  return (
    <PolicyPage
      path="/returns"
      eyebrow="Returns"
      title="Returns & Refunds"
      intro="At FINASTO™, we are committed to providing quality products and a reliable shopping experience. Please review our Returns & Refunds Policy before placing your order."
      updated={UPDATED}
    >
      {/* Highlights */}
      <ul className="grid gap-4 sm:grid-cols-3">
               {highlights.map(({ icon: Icon, title, text }, i) => (
          <AnimatedCard
            as="li"
            key={title}
            delay={i * 0.1}
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

      <PolicySection id="policy" title="Return Policy">
        <p>
          Due to the nature of tea, coffee and other food products, FINASTO™
          does not accept voluntary returns or exchanges for change of mind,
          personal preference or incorrect product selection by the customer.
        </p>
        <Callout icon={ShieldAlert}>
          <p>
            For hygiene and food-safety reasons, opened or unsealed products
            are not eligible for voluntary returns, except in cases involving
            damaged, defective, expired or incorrectly supplied products.
          </p>
        </Callout>
      </PolicySection>

      <PolicySection id="eligible" title="Eligible Returns & Refunds">
        <p>
          Returns, replacements or refunds may be considered in the following
          situations:
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {eligible.map(({ icon: Icon, title, text }, i) => (
            <AnimatedCard
              as="li"
              key={title}
              delay={i * 0.08}
              className="finasto-card p-5"
            >
              <GlowIcon className="h-11 w-11 border border-copper/40 bg-green-bg text-green-deep">
                <Icon
                  className="h-5 w-5"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </GlowIcon>
              <h3 className="mt-4 font-sans text-[15px] font-semibold text-espresso">
                {title}
              </h3>
              <p className="mt-1 font-sans text-[13.5px] leading-relaxed text-warm-gray">
                {text}
              </p>
            </AnimatedCard>
          ))}
        </ul>
        <p>All claims are subject to review and verification.</p>
      </PolicySection>

      <PolicySection id="how" title="How to Request a Return or Refund">
        <div className="finasto-card p-6 sm:p-8">
          <ol aria-label="Return or refund steps" className="flex flex-col gap-8">
            {steps.map((step, i) => (
                            <AnimatedCard
                as="li"
                key={step.title}
                delay={i * 0.1}
                className="relative pl-16 before:absolute before:left-[21px] before:top-12 before:h-[calc(100%-1rem)] before:w-px before:bg-copper/40 last:before:hidden"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-green-deep to-green font-display text-[20px] text-cream shadow-[0_8px_18px_-10px_rgba(35,77,42,0.8)] ring-2 ring-copper/50 ring-offset-2 ring-offset-cream"
                >
                  {i + 1}
                </span>
                <h3 className="font-sans text-[16px] font-semibold text-espresso">
                  {step.title}
                </h3>
                <p className="mt-1 font-sans text-[14px] leading-relaxed text-warm-gray">
                  {step.text}
                </p>
            </AnimatedCard>
            ))}
          </ol>
        </div>
        <Callout icon={ShieldAlert}>
          <p>
            Please do not send products back without first receiving return
            instructions from our team.
          </p>
        </Callout>
      </PolicySection>

      <PolicySection id="reporting" title="Reporting Period">
        <div className="relative overflow-hidden rounded-3xl border border-copper/40 bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] p-6 text-white shadow-[0_30px_60px_-30px_rgba(16,38,15,0.85)] sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-copper/20 blur-3xl"
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <p className="font-display text-[64px] leading-none">
              2
              <span className="ml-2 font-sans text-[15px] font-normal text-white/75">
                business days
              </span>
            </p>
            <div
              aria-hidden="true"
              className="hidden h-14 w-px bg-copper/50 sm:block"
            />
            <p className="font-sans text-[14.5px] leading-relaxed text-white/85">
              Customers should report damaged, incorrect or missing items
              within 2 business days of receiving their order.
            </p>
          </div>
        </div>
        <p>
          For hidden defects or other issues that could not reasonably be
          identified upon delivery, customers should contact our team promptly
          after discovery.
        </p>
      </PolicySection>

      <PolicySection id="shipping-costs" title="Return Shipping Costs">
        <p>
          For verified claims involving damaged, defective, expired or
          incorrectly supplied products, FINASTO™ will cover applicable return
          shipping costs.
        </p>
        <p>
          Where additional shipping costs arise from inaccurate information or
          errors provided by the customer, such costs may be charged to the
          customer where applicable.
        </p>
      </PolicySection>

      <PolicySection id="refunds" title="Refunds">
        <Callout icon={Wallet}>
          <p>
            Approved refunds will be issued exclusively to the original payment
            method used for the purchase. FINASTO™ does not offer refunds
            through alternative payment methods or to different accounts.
          </p>
        </Callout>
        <p>
          Refund processing will follow applicable requirements. The time taken
          for banks, card providers or payment service providers to reflect the
          refund may vary.
        </p>
        <p>
          The refund amount will depend on the circumstances of the claim and
          the applicable resolution.
        </p>
      </PolicySection>

      <PolicySection id="cancel" title="Order Cancellations">
        <p>
          Customers may request order cancellation by contacting FINASTO™ as
          soon as possible before dispatch.
        </p>
        <p>
          Once an order has been dispatched, cancellation through the standard
          order process may no longer be available. However, this does not
          affect any applicable customer rights to request cancellation,
          exchange or a refund.
        </p>
      </PolicySection>

      <PolicySection id="conditions" title="Important Conditions">
        <ul className="grid gap-3 sm:grid-cols-2">
          {conditions.map((text, i) => (
            <AnimatedCard
              as="li"
              key={text}
              delay={(i % 2) * 0.08}
              className={`flex gap-3 rounded-2xl border border-copper/30 bg-green-bg p-4 ${
                i === conditions.length - 1 ? "sm:col-span-2" : ""
              }`}
            >
              <span className="mt-0.5 shrink-0">
                <GlowIcon className="h-6 w-6 bg-gradient-to-br from-green-deep to-green text-cream">
                  <Check
                    className="h-3.5 w-3.5"
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                </GlowIcon>
              </span>
              <p className="font-sans text-[14px] leading-relaxed">{text}</p>
            </AnimatedCard>
          ))}
        </ul>
      </PolicySection>

      <PolicySection id="help" title="Need help?">
        <p>
          Read our{" "}
          {/* <Link href="/faq" className={linkClass}>
            FAQ
          </Link> */}
          {/* , see{" "} */}
          <Link href="/shipping" className={linkClass}>
            Shipping & Delivery
          </Link>
          , or{" "}
          <Link href="/contact" className={linkClass}>
            contact us
          </Link>{" "}
          and include your order number, so we can help faster.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}