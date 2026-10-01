import type { Metadata } from "next";
import { getCountries } from "@/lib/admin/product-queries";
import { ProductForm } from "../../../../components/admin/products/product-form";
import { getFieldSuggestions } from "@/lib/admin/product-queries";

export const metadata: Metadata = {
  title: "Add Product — Finasto Admin",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const suggestions = await getFieldSuggestions();
  const countries = await getCountries();

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Add Product
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          New products start as Draft until you set them Active.
        </p>
      </div>

      <ProductForm
        mode="create"
        product={null}
        countries={countries}
        suggestions={suggestions}
      />
    </div>
  );
}
