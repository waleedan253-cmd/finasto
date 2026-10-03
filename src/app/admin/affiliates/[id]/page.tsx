import { notFound } from "next/navigation";
import { getAffiliateById } from "@/lib/admin/affiliate-queries";
import { listActiveStockistOptions } from "@/lib/admin/stockist-queries";
import { getCurrencyContext } from "@/lib/rates";
import { AffiliateForm } from "@/components/admin/affiliates/affiliate-form";
import { AffiliateSalesPanel } from "@/components/admin/affiliates/affiliate-sales-panel";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditAffiliatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // A malformed id would make Postgres throw; treat it as not found.
  if (!UUID_RE.test(id)) notFound();

  const [affiliate, stockistOptions, { rates, currency }] = await Promise.all([
    getAffiliateById(id),
    listActiveStockistOptions(),
    getCurrencyContext(),
  ]);

  if (!affiliate) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          {affiliate.name}
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          {affiliate.email}
        </p>
      </div>

      <AffiliateForm
        mode="edit"
        affiliate={affiliate}
        stockistOptions={stockistOptions}
      />

      <AffiliateSalesPanel
        affiliate={affiliate}
        rates={rates}
        currency={currency}
      />
    </div>
  );
}
