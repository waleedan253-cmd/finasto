import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBulkOrderById } from "@/lib/admin/bulk-order-queries";
import { BulkOrderDetailPanel } from "@/components/admin/bulk-orders/bulk-order-detail-panel";

// A fixed title on purpose: reading the order here as well would create
// a second signed proof link on every page load.
export const metadata: Metadata = {
  title: "Bulk Order — Finasto Admin",
  robots: { index: false, follow: false },
};

export default async function AdminBulkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getBulkOrderById(id);

  if (!order) notFound();

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-4">
      <Link
        href="/admin/bulk-orders"
        className="inline-flex w-fit items-center gap-1.5 font-sans text-[13px] text-warm-gray transition-colors hover:text-espresso"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
        All bulk orders
      </Link>

      <BulkOrderDetailPanel order={order} />
    </div>
  );
}
