import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/admin/order-queries";
import { OrderDetailPanel } from "@/components/admin/orders/order-detail-panel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrderById(id);
  return {
    title: order
      ? `Order ${order.trackingCode} — Finasto Admin`
      : "Order — Finasto Admin",
    robots: { index: false, follow: false },
  };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-[900px]">
      <OrderDetailPanel order={order} />
    </div>
  );
}
