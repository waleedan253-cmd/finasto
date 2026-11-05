// "use client";

// import { useState, useTransition } from "react";
// import Link from "next/link";
// import { Input, Select } from "antd";
// import {
//   CheckCircle2,
//   Copy,
//   Loader2,
//   Mail,
//   MapPin,
//   User,
// } from "lucide-react";
// import { useCart } from "@/components/providers/cart-provider";
// import { createOrder } from "@/lib/checkout/checkout-actions";
// import { PhoneInput } from "@/components/ui/phone-input"; // adjust path
// import { COUNTRIES } from "@/components/ui/country-select"; // adjust path
// import TextArea from "antd/es/input/TextArea";

// // Name + email checkout — no payment step yet. On success, the cart
// // clears and the tracking code is shown inline (not a separate route),
// // since /track-order already exists as the permanent place to look an
// // order up later.

// export function CheckoutForm() {
//   const { lines, clearCart } = useCart();
//   const [isPending, startTransition] = useTransition();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [country, setCountry] = useState<string | undefined>(undefined);
//   const [line1, setLine1] = useState("");
//   const [line2, setLine2] = useState("");
//   const [city, setCity] = useState("");
//   const [stateRegion, setStateRegion] = useState("");
//   const [postal, setPostal] = useState("");
//   const [formError, setFormError] = useState<string | null>(null);
//   const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
//   const [result, setResult] = useState<{
//     trackingCode: string;
//     email: string;
//   } | null>(null);
//   const [copied, setCopied] = useState(false);

//   function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setFormError(null);
//     setFieldErrors({});

//     if (lines.length === 0) {
//       setFormError("Your bag is empty.");
//       return;
//     }

//     startTransition(async () => {
//       const response = await createOrder({
//         customerName: name,
//         customerEmail: email,
//         customerPhone: phone,
//         shippingCountry: country ?? "",
//         shippingLine1: line1,
//         shippingLine2: line2,
//         shippingCity: city,
//         shippingState: stateRegion,
//         shippingPostalCode: postal,
//         lines: lines.map((l) => ({
//           productId: l.productId,
//           quantity: l.quantity,
//         })),
//       });

//       if (response.success) {
//         setResult({ trackingCode: response.trackingCode, email });
//         clearCart();
//         return;
//       }
//       setFormError(response.error);
//       setFieldErrors(response.fieldErrors ?? {});
//     });
//   }

//   function copyCode() {
//     if (!result) return;
//     navigator.clipboard.writeText(result.trackingCode).then(() => {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     });
//   }

//   if (result) {
//     return (
//       <div className="rounded-2xl border border-border bg-pattern p-6 text-center sm:p-8">
//         <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-bg text-green">
//           <CheckCircle2
//             className="h-7 w-7"
//             strokeWidth={1.8}
//             aria-hidden="true"
//           />
//         </span>

//         <h2 className="mt-4 font-display text-[26px] leading-tight text-espresso">
//           Order received
//         </h2>
//         <p className="mt-2 font-sans text-[14px] text-warm-gray">
//           We've sent a confirmation to {result.email}. Save your tracking code
//           to check your order status anytime.
//         </p>

//         <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-cream-soft px-5 py-4">
//           <span className="font-sans text-[18px] font-semibold tracking-wide text-espresso">
//             {result.trackingCode}
//           </span>
//           <button
//             type="button"
//             onClick={copyCode}
//             aria-label="Copy tracking code"
//             className="flex h-9 w-9 items-center justify-center rounded-full text-espresso/70 transition-colors hover:bg-white hover:text-copper"
//           >
//             <Copy className="h-4 w-4" strokeWidth={1.8} />
//           </button>
//         </div>
//         {copied && (
//           <p className="mt-2 font-sans text-[12px] text-green">
//             Copied to clipboard
//           </p>
//         )}

//         <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
//           <Link
//             href={`/track-order?code=${result.trackingCode}&email=${encodeURIComponent(result.email)}`}
//             className="inline-flex h-11 items-center justify-center rounded-full bg-espresso px-6 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
//           >
//             Track this order
//           </Link>
//           <Link
//             href="/shop"
//             className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong px-6 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper"
//           >
//             Continue shopping
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="rounded-2xl border border-border bg-white p-6 sm:p-8"
//     >
//       <h2 className="font-display text-[22px] leading-tight text-espresso">
//         Your details
//       </h2>
//       <p className="mt-1 font-sans text-[13px] text-warm-gray">
//         No account needed — we'll email your tracking code to the address below.
//       </p>

//       {formError && (
//         <div
//           role="alert"
//           className="mt-4 rounded-xl bg-copper/10 px-4 py-3 font-sans text-[13px] leading-relaxed text-copper"
//         >
//           {formError}
//         </div>
//       )}

//       <div className="mt-5 flex flex-col gap-4">
//         <div>
//           <label className="mb-1 block font-sans text-[13px] text-warm-gray">
//             Full name
//           </label>
//           <Input
//             prefix={
//               <User
//                 className="h-4 w-4 text-warm-gray"
//                 strokeWidth={1.6}
//                 aria-hidden="true"
//               />
//             }
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Your name"
//             status={fieldErrors.customerName ? "error" : undefined}
//             style={{ height: 44 }}
//           />
//           {fieldErrors.customerName && (
//             <p className="mt-1 font-sans text-[12px] text-copper">
//               {fieldErrors.customerName[0]}
//             </p>
//           )}
//         </div>

//         <div>
//           <label className="mb-1 block font-sans text-[13px] text-warm-gray">
//             Email
//           </label>
//           <Input
//             prefix={
//               <Mail
//                 className="h-4 w-4 text-warm-gray"
//                 strokeWidth={1.6}
//                 aria-hidden="true"
//               />
//             }
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="you@example.com"
//             status={fieldErrors.customerEmail ? "error" : undefined}
//             style={{ height: 44 }}
//           />
//           {fieldErrors.customerEmail && (
//             <p className="mt-1 font-sans text-[12px] text-copper">
//               {fieldErrors.customerEmail[0]}
//             </p>
//           )}
//         </div>

//         <div>
//           <label className="mb-1 block font-sans text-[13px] text-warm-gray">
//             Phone number
//           </label>
//           <PhoneInput value={phone} onChange={setPhone} disabled={isPending} />
//           <p className="mt-1 font-sans text-[12px] text-warm-gray">
//             For delivery updates from the courier.
//           </p>
//           {fieldErrors.customerPhone && (
//             <p className="mt-1 font-sans text-[12px] text-copper">
//               {fieldErrors.customerPhone[0]}
//             </p>
//           )}
//         </div>
//       </div>

//       <h2 className="mt-8 flex items-center gap-2 font-display text-[22px] leading-tight text-espresso">
//         <MapPin className="h-5 w-5 text-copper" strokeWidth={1.6} aria-hidden="true" />
//         Shipping address
//       </h2>

//       <div className="mt-4 flex flex-col gap-4">
//         <div>
//           <label className="mb-1 block font-sans text-[13px] text-warm-gray">
//             Country
//           </label>
//           <Select
//             showSearch
//             value={country}
//             onChange={setCountry}
//             placeholder="Select your country"
//             optionFilterProp="label"
//             status={fieldErrors.shippingCountry ? "error" : undefined}
//             style={{ width: "100%", height: 44 }}
//             options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
//           />
//           {fieldErrors.shippingCountry && (
//             <p className="mt-1 font-sans text-[12px] text-copper">
//               {fieldErrors.shippingCountry[0]}
//             </p>
//           )}
//         </div>

//         <div>
//           <label className="mb-1 block font-sans text-[13px] text-warm-gray">
//             Street address
//           </label>
//           <TextArea
          
//             value={line1}
//             onChange={(e) => setLine1(e.target.value)}
//             placeholder="House number and street"
//             autoComplete="shipping address-line1"
//             status={fieldErrors.shippingLine1 ? "error" : undefined}
//             style={{ height: 44 }}
//           />
//           {fieldErrors.shippingLine1 && (
//             <p className="mt-1 font-sans text-[12px] text-copper">
//               {fieldErrors.shippingLine1[0]}
//             </p>
//           )}
//         </div>

//         <div>
//           <label className="mb-1 block font-sans text-[13px] text-warm-gray">
//             Apartment, suite, etc. (optional)
//           </label>
//           <TextArea
//             value={line2}
//             onChange={(e) => setLine2(e.target.value)}
//             autoComplete="shipping address-line2"
//             style={{ height: 44 }}
//           />
//         </div>

//         <div className="grid gap-4 sm:grid-cols-2">
//           <div>
//             <label className="mb-1 block font-sans text-[13px] text-warm-gray">
//               City
//             </label>
//             <Input
//               value={city}
//               onChange={(e) => setCity(e.target.value)}
//               autoComplete="shipping address-level2"
//               status={fieldErrors.shippingCity ? "error" : undefined}
//               style={{ height: 44 }}
//             />
//             {fieldErrors.shippingCity && (
//               <p className="mt-1 font-sans text-[12px] text-copper">
//                 {fieldErrors.shippingCity[0]}
//               </p>
//             )}
//           </div>

//         <div>
//           <label className="mb-1 block font-sans text-[13px] text-warm-gray">
//             Postal code
//           </label>
//           <Input
//             value={postal}
//             onChange={(e) => setPostal(e.target.value)}
//             autoComplete="shipping postal-code"
//             status={fieldErrors.shippingPostalCode ? "error" : undefined}
//             style={{ height: 44, maxWidth: 220 }}
//           />
//           {fieldErrors.shippingPostalCode && (
//             <p className="mt-1 font-sans text-[12px] text-copper">
//               {fieldErrors.shippingPostalCode[0]}
//             </p>
//           )}
//         </div>
       
//         </div>

//       </div>

//       <button
//         type="submit"
//         disabled={isPending}
//         aria-busy={isPending}
//         className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-green cursor-pointer font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep disabled:cursor-not-allowed disabled:bg-disabled"
//       >
//         {isPending && (
//           <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
//         )}
//         {isPending ? "Placing your order..." : "Place Order"}
//       </button>

//       <p className="mt-3 text-center font-sans text-[12px] text-warm-gray">
//         We use your details only to deliver your order. Payment isn't collected
//         yet — this confirms your order details.
//       </p>
//     </form>
//   );
// }

"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Input } from "antd";
import {
  CheckCircle2,
  Copy,
  Loader2,
  Mail,
  MapPin,
  User,
  Check,
} from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { createOrder } from "@/lib/checkout/checkout-actions";
import { PhoneInput } from "@/components/ui/phone-input"; // adjust path
import { CountrySelect } from "@/components/ui/country-select"; // adjust path
import TextArea from "antd/es/input/TextArea";

// Name + email checkout — no payment step yet. On success, the cart
// clears and the tracking code is shown inline (not a separate route),
// since /track-order already exists as the permanent place to look an
// order up later.

// ---- shared styling -------------------------------------------------------

const CARD =
  "rounded-3xl border border-border bg-cream-soft shadow-[0_1px_2px_rgba(60,40,25,0.04),0_18px_40px_-18px_rgba(60,40,25,0.18)]";

// Makes the antd Input look consistent: tall, rounded, same on every device.
const INPUT_STYLE = { height: 48, borderRadius: 12 } as const;

// antd Select keeps its own inner heights, so these arbitrary-variant classes
// stretch it to match the inputs and vertically center the flag + country name.
const SELECT_CLASS = [
  "[&_.ant-select-selector]:!h-12",
  "[&_.ant-select-selector]:!rounded-xl",
  "[&_.ant-select-selector]:!items-center",
  "[&_.ant-select-selection-item]:!flex",
  "[&_.ant-select-selection-item]:!items-center",
  "[&_.ant-select-selection-placeholder]:!flex",
  "[&_.ant-select-selection-placeholder]:!items-center",
  "[&_.ant-select-selection-search-input]:!h-full",
].join(" ");

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-copper ring-1 ring-border">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-[22px] leading-tight text-espresso">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 font-sans text-[13px] leading-relaxed text-warm-gray">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  optional,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 flex items-center justify-between font-sans text-[13px] font-medium text-espresso"
      >
        <span>{label}</span>
        {optional && (
          <span className="font-normal text-[12px] text-warm-gray">
            Optional
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 font-sans text-[12px] text-warm-gray">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 font-sans text-[12px] text-copper">{error}</p>
      )}
    </div>
  );
}

// ---- component ------------------------------------------------------------

export function CheckoutForm() {
  const { lines, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [postal, setPostal] = useState("");
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
        customerPhone: phone,
        shippingCountry: country ?? "",
        shippingLine1: line1,
        shippingLine2: line2,
        shippingCity: city,
        shippingState: stateRegion,
        shippingPostalCode: postal,
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

  // ---- success state ------------------------------------------------------

  if (result) {
    return (
      <div className={`${CARD} overflow-hidden  text-center`}>
        <div className="h-1.5 w-full bg-gradient-to-r from-green via-copper to-espresso" />
        <div className="p-6 sm:p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-bg text-green ring-8 ring-green-bg/50">
            <CheckCircle2
              className="h-8 w-8"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>

          <h2 className="mt-5 font-display text-[28px] leading-tight text-espresso sm:text-[32px]">
            Order received
          </h2>
          <p className="mx-auto mt-2 max-w-[420px] font-sans text-[14px] leading-relaxed text-warm-gray">
            We&apos;ve sent a confirmation to{" "}
            <span className="font-medium text-espresso">{result.email}</span>.
            Save your tracking code to check your order status anytime.
          </p>

          <div className="mx-auto mt-7 max-w-[420px] rounded-2xl border border-dashed border-border-strong bg-cream-soft px-4 py-5">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-copper">
              Tracking code
            </p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="break-all font-sans text-[20px] font-semibold tracking-wide text-espresso sm:text-[22px]">
                {result.trackingCode}
              </span>
              <button
                type="button"
                onClick={copyCode}
                aria-label="Copy tracking code"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-espresso/70 ring-1 ring-border transition-colors hover:text-copper"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green" strokeWidth={2} />
                ) : (
                  <Copy className="h-4 w-4" strokeWidth={1.8} />
                )}
              </button>
            </div>
            <p
              aria-live="polite"
              className="mt-2 h-4 font-sans text-[12px] text-green"
            >
              {copied ? "Copied to clipboard" : ""}
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/track-order?code=${result.trackingCode}&email=${encodeURIComponent(result.email)}`}
              className="inline-flex h-12 items-center justify-center rounded-full bg-espresso px-7 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
            >
              Track this order
            </Link>
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border-strong bg-white px-7 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper hover:text-copper"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- form ---------------------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`${CARD} relative overflow-hidden bg-gradient-to-b from-cream via-cream-soft to-cream p-5 sm:p-8`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green via-copper to-espresso"
      />
      {formError && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-copper/20 bg-copper/10 px-4 py-3 font-sans text-[13px] leading-relaxed text-copper"
        >
          {formError}
        </div>
      )}

      {/* ---- Contact ---- */}
      <SectionHeader
        icon={<User className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />}
        title="Your details"
     
      />

      <div className="mt-6 flex flex-col gap-5">
        <Field
          label="Full name"
          htmlFor="checkout-name"
          error={fieldErrors.customerName?.[0]}
        >
          <Input
            id="checkout-name"
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
            autoComplete="name"
            status={fieldErrors.customerName ? "error" : undefined}
            style={INPUT_STYLE}
          />
        </Field>

        <Field
          label="Email"
          htmlFor="checkout-email"
          error={fieldErrors.customerEmail?.[0]}
        >
          <Input
            id="checkout-email"
            type="email"
            inputMode="email"
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
            autoComplete="email"
            status={fieldErrors.customerEmail ? "error" : undefined}
            style={INPUT_STYLE}
          />
        </Field>

        <Field
          label="Phone number"
          hint="For delivery updates from the courier."
          error={fieldErrors.customerPhone?.[0]}
        >
          <PhoneInput value={phone} onChange={setPhone} disabled={isPending} />
        </Field>
      </div>

      {/* ---- Shipping ---- */}
      <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-border-strong to-transparent" />

      <SectionHeader
        icon={<MapPin className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />}
        title="Shipping address"
        subtitle="Where should we send your order?"
      />

      <div className="mt-6 flex flex-col gap-5">
        <Field
          label="Country"
          error={fieldErrors.shippingCountry?.[0]}
        >
          <CountrySelect
            value={country}
            onChange={setCountry}
            disabled={isPending}
          size="large"
            className={SELECT_CLASS}
            status={fieldErrors.shippingCountry ? "error" : undefined}
          />
        </Field>

        <Field
          label="Shipment address"
          htmlFor="checkout-line1"
          error={fieldErrors.shippingLine1?.[0]}
        >
          <TextArea
            id="checkout-line1"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            placeholder="House or Office number and street"
            autoComplete="shipping address-line1"
            status={fieldErrors.shippingLine1 ? "error" : undefined}
            style={INPUT_STYLE}
          />
        </Field>

        <Field
          label="Apartment, suite, etc."
          htmlFor="checkout-line2"
          optional
        >
          <Input
            id="checkout-line2"
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            placeholder="Apartment, suite, unit"
            autoComplete="shipping address-line2"
            style={INPUT_STYLE}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="City"
            htmlFor="checkout-city"
            error={fieldErrors.shippingCity?.[0]}
          >
            <Input
              id="checkout-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="shipping address-level2"
              status={fieldErrors.shippingCity ? "error" : undefined}
              style={INPUT_STYLE}
            />
          </Field>
<Field
            label="Postal code"
            htmlFor="checkout-postal"
            error={fieldErrors.shippingPostalCode?.[0]}
          >
            <Input
              id="checkout-postal"
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
              autoComplete="shipping postal-code"
              status={fieldErrors.shippingPostalCode ? "error" : undefined}
              style={INPUT_STYLE}
            />
          </Field>
         
        </div>

       
      </div>

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="mt-8 inline-flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-green font-sans text-[15px] font-medium text-cream shadow-[0_10px_24px_-10px_rgba(0,0,0,0.35)] transition-all hover:bg-espresso-deep hover:shadow-[0_14px_28px_-10px_rgba(0,0,0,0.4)] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-disabled disabled:shadow-none"
      >
        {isPending && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {isPending ? "Placing your order..." : "Place Order"}
      </button>

      <p className="mt-4 text-center font-sans text-[12px] leading-relaxed text-warm-gray">
        We use your details only to deliver your order. Payment isn&apos;t
        collected yet — this confirms your order details.
      </p>
    </form>
  );
}