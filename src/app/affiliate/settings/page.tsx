import { notFound } from "next/navigation";
import { getMySettings } from "@/lib/affiliate/settings-queries";
import { CommissionCard } from "@/components/affiliate/settings/commission-card";
import { ProfileForm } from "@/components/affiliate/settings/profile-form";
import { BankDetailsForm } from "@/components/affiliate/settings/bank-details-form";
import { Metadata } from "next";

// The shell already shows "Settings" in the top bar, so this page only
// adds a short intro. Role and active-status checks happen in
// app/affiliate/layout.tsx; getMySettings() re-checks the role itself.
export const metadata: Metadata = {
  title: "Setting ",
  robots: { index: false, follow: false },
};
export default async function AffiliateSettingsPage() {
  const settings = await getMySettings();

  // No affiliate row linked to this login (the layout normally blocks
  // this first, so this is only a safety net).
  if (!settings) notFound();

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      
      <CommissionCard commissionPercent={settings.commissionPercent} />
      <ProfileForm settings={settings} />
      <BankDetailsForm settings={settings} />
    </div>
  );
}
