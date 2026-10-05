import type { Metadata } from "next";
import { Row, Col, Typography } from "antd";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { getStorefrontProducts } from "@/lib/storefront-queries";
import { CheckoutHeader } from "@/components/checkout/checkout-header";

export const metadata: Metadata = {
  title: "Checkout — Finasto",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const products = await getStorefrontProducts();

  return (
    <main className="flex-1 bg-cream-soft py-10 sm:py-14">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
        <CheckoutHeader />

        <Row gutter={[32, 32]} className="mt-6">
          <Col xs={24} md={13}>
            <CheckoutForm />
          </Col>
          <Col xs={24} md={11}>
            <OrderSummary products={products} />
          </Col>
        </Row>
      </div>
    </main>
  );
}
