import type { Metadata } from "next";
import { StockistForm } from "@/components/admin/stockists/stockist-form";
import { getStockistFieldSuggestions } from "@/lib/admin/stockist-queries";
export const metadata: Metadata = {
  title: "Add Stockist — Finasto Admin",
  robots: { index: false, follow: false },
};

export default async function NewStockistPage() {
  const suggestions = await getStockistFieldSuggestions();
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Add Stockist
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          They'll receive an invite email to set their password and access their
          dashboard.
        </p>
      </div>
      <StockistForm mode="create" stockist={null} suggestions={suggestions} />
    </div>
  );
}
