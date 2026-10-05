"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "antd";
import { CheckCircle2, Copy, Loader2, Mail, User } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { createOrder } from "@/lib/checkout/checkout-actions";

// Name + email checkout — no payment step yet. On success, the cart
// clears and the tracking code is shown inline (not a separate route),
// since /track-order already exists as the permanent place to look an
// order up later.

export function CheckoutForm() {
  const { lines, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<{
    trackingCode: string;
    email: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (lines.length === 0) {
      setFormError("Your bag is empty.");
      return;
    }

    startTransition(async () => {
      const response = await createOrder({
        customerName: name,
        customerEmail: email,
        lines: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
        })),
      });

      if (response.success) {
        setResult({ trackingCode: response.trackingCode, email });
        clearCart();
        return;
      }
      setFormError(response.error);
      setFieldErrors(response.fieldErrors ?? {});
    });
  }

  function copyCode() {
    if (!result) return;
    navigator.clipboard.writeText(result.trackingCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center sm:p-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-bg text-green">
          <CheckCircle2
            className="h-7 w-7"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>

        <h2 className="mt-4 font-display text-[26px] leading-tight text-espresso">
          Order received
        </h2>
        <p className="mt-2 font-sans text-[14px] text-warm-gray">
          We've sent a confirmation to {result.email}. Save your tracking code
          to check your order status anytime.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-cream-soft px-5 py-4">
          <span className="font-sans text-[18px] font-semibold tracking-wide text-espresso">
            {result.trackingCode}
          </span>
          <button
            type="button"
            onClick={copyCode}
            aria-label="Copy tracking code"
            className="flex h-9 w-9 items-center justify-center rounded-full text-espresso/70 transition-colors hover:bg-white hover:text-copper"
          >
            <Copy className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
        {copied && (
          <p className="mt-2 font-sans text-[12px] text-green">
            Copied to clipboard
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={`/track-order?code=${result.trackingCode}&email=${encodeURIComponent(result.email)}`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-espresso px-6 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
          >
            Track this order
          </Link>
          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong px-6 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-white p-6 sm:p-8"
    >
      <h2 className="font-display text-[22px] leading-tight text-espresso">
        Your details
      </h2>
      <p className="mt-1 font-sans text-[13px] text-warm-gray">
        No account needed — we'll email your tracking code to the address below.
      </p>

      {formError && (
        <div
          role="alert"
          className="mt-4 rounded-xl bg-copper/10 px-4 py-3 font-sans text-[13px] leading-relaxed text-copper"
        >
          {formError}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-4">
        <div>
          <label className="mb-1 block font-sans text-[13px] text-warm-gray">
            Full name
          </label>
          <Input
            prefix={
              <User
                className="h-4 w-4 text-warm-gray"
                strokeWidth={1.6}
                aria-hidden="true"
              />
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            status={fieldErrors.customerName ? "error" : undefined}
            style={{ height: 44 }}
          />
          {fieldErrors.customerName && (
            <p className="mt-1 font-sans text-[12px] text-copper">
              {fieldErrors.customerName[0]}
            </p>
          )}
        </div>

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
            status={fieldErrors.customerEmail ? "error" : undefined}
            style={{ height: 44 }}
          />
          {fieldErrors.customerEmail && (
            <p className="mt-1 font-sans text-[12px] text-copper">
              {fieldErrors.customerEmail[0]}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-espresso font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep disabled:cursor-not-allowed disabled:bg-disabled"
      >
        {isPending && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {isPending ? "Placing your order..." : "Place Order"}
      </button>

      <p className="mt-3 text-center font-sans text-[12px] text-warm-gray">
        Payment isn't collected yet — this confirms your order details.
      </p>
    </form>
  );
}
