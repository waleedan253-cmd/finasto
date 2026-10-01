import { listActiveStockistOptions } from "@/lib/admin/stockist-queries";
import { AffiliateForm } from "@/components/admin/affiliates/affiliate-form";

export default async function NewAffiliatePage() {
  const stockistOptions = await listActiveStockistOptions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Add Affiliate
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          Enter a name and email. The affiliate completes the rest from their
          own dashboard.
        </p>
      </div>

      <AffiliateForm
        mode="create"
        affiliate={null}
        stockistOptions={stockistOptions}
      />
    </div>
  );
}
