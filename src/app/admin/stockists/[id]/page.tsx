import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getStockistById,
  getStockistFieldSuggestions,
} from "@/lib/admin/stockist-queries";
import { StockistForm } from "@/components/admin/stockists/stockist-form";
import { AssignedAffiliatesPanel } from "@/components/admin/stockists/assigned-affiliates-panel";
import { getCurrencyContext } from "@/lib/rates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const stockist = await getStockistById(id);
  return {
    title: stockist
      ? `Edit ${stockist.name} — Finasto Admin`
      : "Edit Stockist — Finasto Admin",
    robots: { index: false, follow: false },
  };
}
export default async function EditStockistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [stockist, { rates, currency }, suggestions] = await Promise.all([
    getStockistById(id),
    getCurrencyContext(),
    getStockistFieldSuggestions(),
  ]);

  if (!stockist) notFound();

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Edit Stockist
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          {stockist.name} · Last updated{" "}
          {new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(new Date(stockist.updatedAt))}
        </p>
      </div>

      <AssignedAffiliatesPanel
        stockist={stockist}
        rates={rates}
        currency={currency}
      />
      <StockistForm mode="edit" stockist={stockist} suggestions={suggestions} />
    </div>
  );
}
