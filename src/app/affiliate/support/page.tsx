import type { Metadata } from "next";
import { MessageCircle, Mail } from "lucide-react";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
// import { PageHeader } from "@/components/affiliat";
import { SupportEmailForm } from "@/components/affiliate/support/support-email-form";
import { Reveal } from "@/components/affiliate/dashboard/reveal";

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
      <Reveal>
        <header className="rounded-2xl bg-gradient-to-br from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 p-[1.5px] shadow-[0_18px_44px_-20px_rgba(172,131,78,0.55)]">
          <div className="relative isolate overflow-hidden rounded-[15px] bg-gradient-to-br from-aff-green-950 via-aff-green-900 to-aff-green-800">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -top-16 -z-10 h-48 w-48 rounded-full bg-aff-gold-400/15 blur-3xl"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-300 to-transparent"
            />
            <div className="relative z-10 flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
              <div className="min-w-0">
                <h1 className="break-words font-display text-[24px] font-semibold leading-tight text-aff-cream-50 sm:text-[30px]">
                  Your{" "}
                  <span className="bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 bg-clip-text text-transparent">
                    Support
                  </span>
                </h1>
                <p className="mt-1.5 max-w-xl font-sans text-[13px] leading-relaxed text-aff-cream-50/75 sm:text-[14px]">
                  Questions about orders, payouts or your account? Message the
                  Finasto team directly.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 px-6 font-sans text-[14px] font-semibold text-aff-green-950 shadow-[0_10px_26px_-12px_rgba(241,204,156,0.7)] transition-all duration-200 active:scale-[0.97] sm:w-auto [@media(hover:hover)]:hover:-translate-y-0.5"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Chat with us on WhatsApp
                  </a>
                ) : (
                  <p className="rounded-full border border-aff-gold-400/40 bg-aff-green-950/60 px-3.5 py-1.5 font-sans text-[12px] font-medium text-aff-gold-300">
                    WhatsApp chat is unavailable right now
                  </p>
                )}
               
              </div>
            </div>
          </div>
        </header>
      </Reveal>


      <div className="grid gap-4 sm:gap-6">
    
        {/* Email card */}
        <section className="aff-card flex touch-manipulation flex-col p-5 transition-all duration-300 active:scale-[0.99] motion-reduce:transition-none sm:p-6 [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[0_20px_36px_-18px_rgba(172,131,78,0.55)]">
          <div className="grid gap-5 lg:grid-cols-[320px_1fr] lg:gap-8">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-aff-gold-400/25 text-[#7A5526]">
                <Mail className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-[18px] leading-tight text-aff-green-900">
                Send us an email
              </h2>
              <p className="mt-2 font-sans text-[13px] leading-relaxed text-aff-muted">
                Prefer to write it down? Send a message and the team will reply
                to your login email.
              </p>
            </div>

            <div className="min-w-0">
              <SupportEmailForm replyTo={user.email ?? ""} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}