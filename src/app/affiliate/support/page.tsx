import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

// Server component. One job: let the affiliate talk to the admin on
// WhatsApp. The admin's number comes from NEXT_PUBLIC_SUPPORT_WHATSAPP
// (international format, digits only, e.g. 923001234567). The chat opens
// with a message already filled in (name + referral code), so the admin
// knows who is writing. The affiliate is found from the signed-in user.

export const metadata: Metadata = {
  title: "Support",
};

export default async function AffiliateSupportPage() {
  const { user } = await requireRole("affiliate");
  const supabase = await createClient();

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("name, referral_code")
    .eq("profile_id", user.id)
    .maybeSingle();

  // Keep digits only, so "+92 300 1234567" in the env file still works.
  const number = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "").replace(
    /\D/g,
    "",
  );

  const text = affiliate
    ? `Hello Finasto, I'm ${affiliate.name} (affiliate code ${affiliate.referral_code}). I need help with: `
    : "Hello Finasto, I need help with: ";

  const whatsappUrl = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : null;

  return (
    <div>
      <h1 className="font-display text-[28px] leading-tight text-espresso">
        Support
      </h1>
      <p className="mt-2 mb-6 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
        Questions about orders, payouts or your account? Message the Finasto
        team directly.
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
          Your name and affiliate code are added to the message for you, so we
          can find your account quickly. Just describe what you need.
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
