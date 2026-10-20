import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PolicyPage, PolicySection } from "@/components/shop/policy-page";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about Finasto coffee and tea: orders, shipping, returns, products and payments.",
};

// EDIT BEFORE LAUNCH: every answer below is a placeholder written to look
// complete. Replace each one with your real policy, and keep these answers
// the same as the Shipping and Returns pages.
const UPDATED = "October 2026";

type Faq = { q: string; a: string };
type Group = { id: string; title: string; items: Faq[] };

const groups: Group[] = [
  {
    id: "orders",
    title: "Orders & shipping",
    items: [
      {
        q: "How long does delivery take?",
        a: "Orders are packed within 1 to 3 business days. After that, delivery takes about 2 to 5 business days in Indonesia and 7 to 21 business days for international orders, depending on the country.",
      },
      {
        q: "How do I track my order?",
        a: "When your order ships we email you a tracking number and a link. Tracking can take up to 48 hours to show movement after the first scan.",
      },
      {
        q: "Do you ship worldwide?",
        a: "Yes. We ship from Bali to customers around the world. The shipping cost is shown at checkout before you pay.",
      },
      {
        q: "Will I pay customs or import taxes?",
        a: "Orders sent to another country may be charged import duties or taxes by that country. These are not included in our prices and are the responsibility of the buyer.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "You can cancel or change an order before it ships by contacting us as soon as possible. Once it has shipped, it cannot be changed, but you can return it under our returns policy.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & refunds",
    items: [
      {
        q: "Can I return an item?",
        a: "Unopened products in their original sealed packaging can be returned within 14 days of delivery. Opened coffee and tea cannot be returned for food-safety reasons, unless the item arrived damaged or is not what you ordered.",
      },
      {
        q: "My order arrived damaged. What do I do?",
        a: "Contact us within 7 days of delivery with your order number and a photo of the parcel and the product. We will send a replacement or refund you, and you do not need to send the product back.",
      },
      {
        q: "When will I get my refund?",
        a: "After we receive and approve your return, the refund goes back to your original payment method within 5 to 10 business days.",
      },
    ],
  },
  {
    id: "products",
    title: "Products",
    items: [
      {
        q: "Where does your coffee and tea come from?",
        a: "Everything in our shop is grown on small Balinese farms, roasted or blended in small batches, and packed fresh before it travels to you.",
      },
      {
        q: "How should I store my coffee and tea?",
        a: "Keep the pouch tightly sealed in a cool, dry place away from sunlight, heat and strong smells. Once opened, enjoy it within a few weeks for the best flavour.",
      },
      {
        q: "Do your products contain allergens?",
        a: "Please check the ingredients on each product page and on the pouch. If you have an allergy, contact us before ordering and we will help.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & account",
    items: [
      {
        q: "Which payment methods do you accept?",
        a: "The accepted payment methods are shown at checkout. Your payment is processed securely, and we never store your full card details.",
      },
      {
        q: "Do I need an account to order?",
        a: "No. You can check out as a guest. We use your email to send your order confirmation and tracking details.",
      },
      {
        q: "Which currency are prices shown in?",
        a: "Prices are shown in the currency of your selected market. If your country is not listed, prices are shown in US dollars.",
      },
    ],
  },
];

// FAQ structured data, so search engines can show the questions in results.
// "<" is escaped so the text can never close the script tag.
const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: groups.flatMap((g) =>
    g.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  ),
}).replace(/</g, "\\u003c");

const link = "font-medium text-copper underline-offset-4 hover:underline";

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <PolicyPage
        path="/faq"
        eyebrow="Help"
        title="Frequently asked questions"
        intro="Quick answers to the questions we hear most. If you cannot find yours, we are happy to help."
        updated={UPDATED}
      >
        <nav aria-label="FAQ topics">
          <ul className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="inline-flex h-9 items-center rounded-full border border-border-strong bg-white px-4 font-sans text-[13px] text-espresso transition-colors hover:border-copper hover:text-copper dark:border-border"
                >
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {groups.map((g) => (
          <PolicySection key={g.id} id={g.id} title={g.title}>
            <div className="finasto-card divide-y divide-border">
              {g.items.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-sans text-[15px] font-medium text-espresso transition-colors hover:text-copper [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-warm-gray transition-transform duration-200 group-open:rotate-180"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="px-5 pb-5 font-sans text-[14px] leading-relaxed text-warm-gray">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </PolicySection>
        ))}

        <PolicySection id="more-help" title="Still need help?">
          <p>
            Read our{" "}
            <Link href="/shipping" className={link}>
              Shipping & Delivery
            </Link>{" "}
            and{" "}
            <Link href="/returns" className={link}>
              Returns & Refunds
            </Link>{" "}
            pages, or{" "}
            <Link href="/contact" className={link}>
              contact us
            </Link>
            . Please include your order number so we can help faster.
          </p>
        </PolicySection>
      </PolicyPage>
    </>
  );
}