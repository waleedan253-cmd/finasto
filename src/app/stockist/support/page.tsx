import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { getMyStockistProfile } from "@/lib/stockist/settings-queries";

// Server component. One job: let the stockist talk to the admin on
// WhatsApp. Same number as the affiliate Support page
// (NEXT_PUBLIC_SUPPORT_WHATSAPP, international format, digits only). The
// chat opens with the stockist's name and email already filled in, so the
// admin knows who is writing. getMyStockistProfile() checks the stockist
// role itself.

export const metadata: Metadata = {
  title: "Support",
};

export default async function StockistSupportPage() {
  const profile = await getMyStockistProfile();

  // Keep digits only, so "+92 300 1234567" in the env file still works.
  const number = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "").replace(
    /\D/g,
    "",
  );

  const text = profile
    ? `Hello Finasto, I'm ${profile.name} (stockist, ${profile.email}). I need help with: `
    : "Hello Finasto, I'm a stockist. I need help with: ";

  const whatsappUrl = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : null;

  return (
    <div>
      <h1 className="font-display text-[28px] leading-tight text-espresso">
        Help Center
      </h1>
      <p className="mt-2 mb-6 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
        Questions about bulk orders, payments, stock or your affiliates? Message
        the Finasto team directly.
      </p>

      <div className="rounded-2xl border border-border p-5 sm:p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-bg text-green">
          <MessageCircle
            className="h-5 w-5"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>

        <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
          Chat with us on WhatsApp
        </h2>
        <p className="mt-2 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
          Your name and email are added to the message for you, so we can find
          your account quickly. Just describe what you need.
        </p>

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-espresso px-6 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Chat on WhatsApp
          </a>
        ) : (
          <div className="mt-5 rounded-xl bg-copper/10 px-4 py-3 font-sans text-[13px] leading-relaxed text-copper">
            Support chat isn&apos;t available right now. Please try again later.
          </div>
        )}
      </div>
    </div>
  );
}
