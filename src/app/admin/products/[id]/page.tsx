import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCountries, getProductById } from "@/lib/admin/product-queries";
import { ProductForm } from "../../../../components/products/product-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return {
    title: product
      ? `Edit ${product.name} — Finasto Admin`
      : "Edit Product — Finasto Admin",
    robots: { index: false, follow: false },
  };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, countries] = await Promise.all([
    getProductById(id),
    getCountries(),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Edit Product
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          {product.name} · Last updated{" "}
          {new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(new Date(product.updatedAt))}
        </p>
      </div>

      <ProductForm mode="edit" product={product} countries={countries} />
    </div>
  );
}
