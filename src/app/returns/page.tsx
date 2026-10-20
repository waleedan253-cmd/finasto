import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, ShieldCheck, Wallet, type LucideIcon } from "lucide-react";
import { PolicyPage, PolicySection } from "@/components/shop/policy-page";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "Finasto's returns and refunds policy: what can be returned, how to start a return, damaged or wrong items, and when you get your refund.",
};

// EDIT BEFORE LAUNCH: the periods, conditions and who pays for return
// shipping below are placeholders. Replace them with your real policy, and
// check the consumer rules of the countries you sell to.
const UPDATED = "October 2026";

const highlights: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: RotateCcw,
    title: "14-day returns",
    text: "Return unopened products within 14 days of delivery.",
  },
  {
    icon: ShieldCheck,
    title: "Damaged or wrong items",
    text: "We replace or refund them, and we cover the shipping.",
  },
  {
    icon: Wallet,
    title: "Refund to your payment method",
    text: "Refunds are issued within 5 to 10 business days.",
  },
];

const steps = [
  {
    title: "Contact us",
    text: "Send your order number and the reason for the return within 14 days of delivery.",
  },
  {
    title: "Get approval",
    text: "We reply within 2 business days with a return address and instructions.",
  },
  {
    title: "Send the parcel",
    text: "Pack the products securely in their original packaging and ship them with tracking.",
  },
  {
    title: "Receive your refund",
    text: "We inspect the parcel and refund you once it arrives.",
  },
];

const link = "font-medium text-copper underline-offset-4 hover:underline";

export default function ReturnsPage() {
  return (
    <PolicyPage
      path="/returns"
      eyebrow="Returns"
      title="Returns & Refunds"
      intro="We want you to love every cup. If something is not right, here is how we make it right."
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

      <PolicySection id="eligibility" title="What can be returned">
        <p>
          Because coffee and tea are food products, we can only accept returns
          of items that are:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 marker:text-copper">
          <li>unopened, unused and in the original sealed packaging;</li>
          <li>returned within 14 days of the delivery date; and</li>
          <li>accompanied by your order number.</li>
        </ul>
        <p>
          Opened products cannot be returned for hygiene and food-safety
          reasons, unless they arrive damaged or are not what you ordered (see
          below).
        </p>
      </PolicySection>

      <PolicySection id="how" title="How to return an item">
        <ol className="flex flex-col gap-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-copper/40 bg-copper/10 font-display text-[15px] italic text-copper"
              >
                {i + 1}
              </span>
              <div>
                <p className="font-sans text-[15px] font-semibold text-espresso">
                  {step.title}
                </p>
                <p className="mt-0.5 text-[14px]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </PolicySection>

      <PolicySection id="damaged" title="Damaged, wrong or missing items">
        <p>
          If your order arrives damaged, is not what you ordered, or an item is
          missing, contact us within 7 days of delivery with your order number
          and a clear photo of the parcel and the product. We will send a
          replacement or refund you, and you do not need to send the product
          back. We cover the cost.
        </p>
      </PolicySection>

      <PolicySection id="refunds" title="When you get your refund">
        <p>
          After we receive and inspect your return, we email you to confirm. If
          it is approved, the refund goes back to your original payment method
          within 5 to 10 business days. Your bank or card provider may need
          extra time to show it.
        </p>
        <p>
          The original shipping cost is refunded only if the return is because
          of our mistake or a damaged item. For other returns, the refund is
          the product price.
        </p>
      </PolicySection>

      <PolicySection id="shipping-costs" title="Return shipping costs">
        <p>
          If you return an item because you changed your mind, you pay the
          return shipping and we recommend a tracked service, because we cannot
          refund parcels that are lost on their way back to us. If the return
          is our mistake, we pay.
        </p>
      </PolicySection>

      <PolicySection id="cancel" title="Cancelling an order">
        <p>
          You can cancel an order before it ships by contacting us as soon as
          possible. Once an order has shipped, it cannot be cancelled, but you
          can return it under the rules above. See{" "}
          <Link href="/shipping" className={link}>
            Shipping & Delivery
          </Link>{" "}
          for processing times.
        </p>
      </PolicySection>

      <PolicySection id="help" title="Need help?">
        <p>
          Read our{" "}
          <Link href="/faq" className={link}>
            FAQ
          </Link>{" "}
          or{" "}
          <Link href="/contact" className={link}>
            contact us
          </Link>{" "}
          and include your order number, so we can help faster.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}