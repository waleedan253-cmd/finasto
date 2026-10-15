import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/auth/actions";
import { StockistShell } from "@/components/stockist/layout/stockist-shell";

export const metadata: Metadata = {
  title: "Stockist — Finasto",
  robots: { index: false, follow: false },
};

export default async function StockistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative server-side gate for everything under /affiliate.
  const { user, name } = await requireRole("stockist");

  // Having the affiliate role is not enough: the admin can pause or
  // soft-delete an affiliate, and their login still exists. Check the
  // affiliates row on every request (RLS lets an affiliate read only
  // their own row).
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_stockist_profile");
  if (error) console.error("[stockist layout]", error.message);
  const stockist = (data as { status: string }[] | null)?.[0];

  if (!stockist || stockist.status !== "active") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center">
          <h1 className="font-display text-[24px] leading-tight text-espresso">
            Account unavailable
          </h1>
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-warm-gray">
            Your stockist account is currently inactive or has been removed.
            Please contact the Finasto team if you think this is a mistake.
          </p>
          <form action={signOutAction} className="mt-6">
            <button
              type="submit"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-espresso px-6 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <StockistShell name={name} email={user.email ?? ""} profileLocked={true}>
      {children}
    </StockistShell>
  );
}
