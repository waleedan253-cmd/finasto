import type { Metadata } from "next";
import { MessageCircle, Mail } from "lucide-react";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
// import { PageHeader } from "@/components/affiliat";
import { SupportEmailForm } from "@/components/affiliate/support/support-email-form";

// Server component. Two ways to reach the admin: WhatsApp (number from
// NEXT_PUBLIC_SUPPORT_WHATSAPP, digits only, e.g. 923001234567) and an
// email form. The affiliate is found from the signed-in user, so the
// name and referral code are never typed by the affiliate.

export const metadata: Metadata = {
  title: "Support",
  robots: { index: false, follow: false },
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
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 sm:gap-6">
      {/* <PageHeader
        title="Your"
        highlight="Support"
        description="Questions about orders, payouts or your account? Message the Finasto team directly."
      /> */}


      <div className="grid gap-4 sm:gap-6 lg:grid-cols-1">
        {/* WhatsApp card */}
      
  <section className="aff-card flex flex-col p-5 sm:p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(47,158,107,0.12)] text-[#1F7A52]">
            <MessageCircle
              className="h-5 w-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>

          <h2 className="mt-4 font-display text-[18px] leading-tight text-aff-green-900">
            Chat with us on WhatsApp
          </h2>
          <p className="mt-2 max-w-xl font-sans text-[13px] leading-relaxed text-aff-muted">
            Your name and affiliate code are added to the message for you, so we
            can find your account quickly. Just describe what you need.
          </p>

          <div className="mt-5">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-aff-gold-600/40 bg-aff-green-900 px-6 font-sans text-[14px] font-medium text-aff-gold-300 transition-colors hover:bg-aff-green-800"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Chat on WhatsApp
              </a>
            ) : (
              <div className="rounded-xl border border-aff-gold-600/40 bg-aff-gold-400/20 px-4 py-3 font-sans text-[13px] leading-relaxed text-[#7A5526]">
                Support chat isn&apos;t available right now. Please try again
                later, or send us an email.
              </div>
            )}
          </div>
        </section>
        {/* Email card */}
        <section className="aff-card flex flex-col p-5 sm:p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-aff-gold-400/25 text-[#7A5526]">
            <Mail className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </span>

          <h2 className="mt-4 font-display text-[18px] leading-tight text-aff-green-900">
            Send us an email
          </h2>
          <p className="mt-2 max-w-xl font-sans text-[13px] leading-relaxed text-aff-muted">
            Prefer to write it down? Send a message and the team will reply to
            your login email.
          </p>

          <div className="mt-5">
            <SupportEmailForm replyTo={user.email ?? ""} />
          </div>
        </section>
      </div>
    </div>
  );
}