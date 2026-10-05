import type { Metadata } from "next";
import { TrackOrderClient } from "../../components/track-order/track-order-client";

export const metadata: Metadata = {
  title: "Track Your Order — Finasto",
  description:
    "Check the status of your Finasto order using your email and tracking code.",
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; email?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex-1 bg-cream-soft py-10 sm:py-14">
      <div className="mx-auto max-w-[560px] px-5 sm:px-8">
        <TrackOrderClient
          initialCode={params.code ?? ""}
          initialEmail={params.email ?? ""}
        />
      </div>
    </main>
  );
}
