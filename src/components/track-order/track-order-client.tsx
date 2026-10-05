"use client";

import { useState, useTransition } from "react";
import { Input, Typography } from "antd";
import { Loader2, Mail, Search } from "lucide-react";
import { lookupOrderStatusAction } from "../../lib/track-order/track-order-actions";
import type { OrderStatusResult } from "@/lib/track-order/track-order-queries";
import { TrackOrderResult } from "@/components/track-order/track-order-result";

export function TrackOrderClient({
  initialCode,
  initialEmail,
}: {
  initialCode: string;
  initialEmail: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(initialCode);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderStatusResult | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await lookupOrderStatusAction({
        email,
        trackingCode: code,
      });
      if (result.success) {
        setOrder(result.order);
      } else {
        setOrder(null);
        setError(result.error);
      }
    });
  }

  if (order) {
    return (
      <div>
        <TrackOrderResult order={order} />
        <button
          style={{ cursor: "pointer" }}
          type="button"
          onClick={() => setOrder(null)}
          className="mt-4 font-sans text-[13px] text-warm-gray underline decoration-dotted underline-offset-2 hover:text-espresso"
        >
          Track another order
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-white p-6 sm:p-8"
    >
      <Typography.Title
        level={1}
        className="!font-display !text-[28px] !leading-tight !text-espresso"
      >
        Track Your Order
      </Typography.Title>
      <Typography.Paragraph className="!mt-1 !font-sans !text-[14px] !text-warm-gray">
        Enter the email and tracking code from your order confirmation.
      </Typography.Paragraph>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl bg-copper/10 px-4 py-3 font-sans text-[13px] leading-relaxed text-copper"
        >
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-4">
        <div>
          <label className="mb-1 block font-sans text-[13px] text-warm-gray">
            Email
          </label>
          <Input
            prefix={
              <Mail
                className="h-4 w-4 text-warm-gray"
                strokeWidth={1.6}
                aria-hidden="true"
              />
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ height: 44 }}
          />
        </div>

        <div>
          <label className="mb-1 block font-sans text-[13px] text-warm-gray">
            Tracking code
          </label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="FIN-20261103-A7K2"
            style={{ height: 44, fontFamily: "monospace" }}
          />
        </div>
      </div>

      <button
        style={{ cursor: "pointer" }}
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-espresso font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep disabled:cursor-not-allowed disabled:bg-disabled"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Search className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        )}
        {isPending ? "Searching..." : "Track Order"}
      </button>
    </form>
  );
}
