// "use client";

// import { useCallback, useEffect, useState, useTransition } from "react";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { Input, Select } from "antd";
// import { X } from "lucide-react";
// import type {
//   CommissionState,
//   OrderStatus,
//   PaymentStatus,
// } from "@/lib/affiliate/orders-queries";
// import {
//   COMMISSION_STATE_OPTIONS,
//   ORDER_STATUS_OPTIONS,
//   PAYMENT_STATUS_OPTIONS,
// } from "./order-status-badge";

// // Search + filter bar for the affiliate Orders list. All state lives in
// // the URL (?q=&status=&payment=&commission=), same pattern as
// // affiliate-filters.tsx, so the list is shareable and bookmarkable and
// // the server page re-queries on every change.
// //
// // An empty Select (cleared, or never chosen) means "all": its param is
// // simply removed from the URL.

// function useDebouncedValue<T>(value: T, delayMs: number): T {
//   const [debounced, setDebounced] = useState(value);
//   useEffect(() => {
//     const id = setTimeout(() => setDebounced(value), delayMs);
//     return () => clearTimeout(id);
//   }, [value, delayMs]);
//   return debounced;
// }

// export function OrdersFilters({
//   search,
//   status,
//   paymentStatus,
//   commissionState,
//   resultCount,
// }: {
//   search: string;
//   status: OrderStatus | undefined;
//   paymentStatus: PaymentStatus | undefined;
//   commissionState: CommissionState | undefined;
//   resultCount: number;
// }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const [isPending, startTransition] = useTransition();

//   const [query, setQuery] = useState(search);
//   const debouncedQuery = useDebouncedValue(query, 350);

//   const updateParams = useCallback(
//     (next: {
//       q?: string;
//       status?: string;
//       payment?: string;
//       commission?: string;
//     }) => {
//       const params = new URLSearchParams(searchParams.toString());

//       // Set a param, or remove it when the value is empty.
//       const apply = (key: string, value: string | undefined) => {
//         if (value === undefined) return;
//         if (value) params.set(key, value);
//         else params.delete(key);
//       };

//       apply("q", next.q);
//       apply("status", next.status);
//       apply("payment", next.payment);
//       apply("commission", next.commission);
//       params.delete("page"); // a new filter always starts at page 1

//       const qs = params.toString();
//       startTransition(() => {
//         router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
//       });
//     },
//     [pathname, router, searchParams],
//   );

//   useEffect(() => {
//     if (debouncedQuery !== search) updateParams({ q: debouncedQuery });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [debouncedQuery]);

//   const hasFilters = Boolean(
//     search || status || paymentStatus || commissionState,
//   );

//   function clearAll() {
//     setQuery("");
//     startTransition(() => {
//       router.push(pathname, { scroll: false });
//     });
//   }

//    return (
    
//     <div className="relative isolate flex flex-col gap-4 overflow-hidden rounded-2xl border border-aff-gold-400/30 bg-gradient-to-br from-aff-green-950 via-aff-green-900 to-aff-green-800 p-4 shadow-[0_18px_44px_-22px_rgba(172,131,78,0.6)] sm:p-5">
//       <span
//         aria-hidden="true"
//         className="pointer-events-none absolute -right-12 -top-12 -z-10 h-44 w-44 rounded-full bg-aff-gold-400/15 blur-3xl" 
//       />
//       <span
//         aria-hidden="true"
//         className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-300 to-transparent"
//       />
      
//       <Input.Search
//         size="large"
//         allowClear
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         placeholder="Search by order number..."
//         className="w-full sm:max-w-sm"
//         aria-label="Search orders by order number"
//       /> 

//       <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
//         <Select
//           value={status}
//           onChange={(value) => updateParams({ status: value ?? "" })}
//           allowClear
//           placeholder="All order statuses"
//           className="w-full lg:w-[190px]"
//           aria-label="Filter by order status"
//           options={ORDER_STATUS_OPTIONS}
//         />

//         <Select
//           value={paymentStatus}
//           onChange={(value) => updateParams({ payment: value ?? "" })}
//           allowClear
//           placeholder="All payment statuses"
//           className="w-full lg:w-[200px]"
//           aria-label="Filter by payment status"
//           options={PAYMENT_STATUS_OPTIONS}
//         />

//         <Select
//           value={commissionState}
//           onChange={(value) => updateParams({ commission: value ?? "" })}
//           allowClear
//           placeholder="All commission states"
//           className="w-full sm:col-span-2 lg:col-span-1 lg:w-[210px]"
//           aria-label="Filter by commission state"
//           options={COMMISSION_STATE_OPTIONS}
//         />

//         {hasFilters && (
//           <button
//             type="button"
//             onClick={clearAll}
//             className="inline-flex h-8 w-fit cursor-pointer items-center gap-1 rounded-full border border-aff-border bg-aff-ivory px-3 font-sans text-[13px] font-medium text-aff-muted transition-colors hover:border-aff-gold-500 hover:text-aff-green-900"
//           >
//             <X className="h-3.5 w-3.5" aria-hidden="true" />
//             Clear filters
//           </button>
//         )}
//       </div>

     
//     </div>
//   );
// }
"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Select } from "antd";
import { X } from "lucide-react";
import type {
  CommissionState,
  OrderStatus,
  PaymentStatus,
} from "@/lib/affiliate/orders-queries";
import {
  COMMISSION_STATE_OPTIONS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "./order-status-badge";

// Search + filter bar for the affiliate Orders list. All state lives in
// the URL (?q=&status=&payment=&commission=), same pattern as
// affiliate-filters.tsx, so the list is shareable and bookmarkable and
// the server page re-queries on every change.
//
// An empty Select (cleared, or never chosen) means "all": its param is
// simply removed from the URL.

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function OrdersFilters({
  search,
  status,
  paymentStatus,
  commissionState,
  resultCount,
}: {
  search: string;
  status: OrderStatus | undefined;
  paymentStatus: PaymentStatus | undefined;
  commissionState: CommissionState | undefined;
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(search);
  const debouncedQuery = useDebouncedValue(query, 350);

  const updateParams = useCallback(
    (next: {
      q?: string;
      status?: string;
      payment?: string;
      commission?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      // Set a param, or remove it when the value is empty.
      const apply = (key: string, value: string | undefined) => {
        if (value === undefined) return;
        if (value) params.set(key, value);
        else params.delete(key);
      };

      apply("q", next.q);
      apply("status", next.status);
      apply("payment", next.payment);
      apply("commission", next.commission);
      params.delete("page"); // a new filter always starts at page 1

      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (debouncedQuery !== search) updateParams({ q: debouncedQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const hasFilters = Boolean(
    search || status || paymentStatus || commissionState,
  );

  function clearAll() {
    setQuery("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  return (
    <div className="relative isolate flex flex-col gap-4 overflow-hidden rounded-2xl border border-aff-border bg-gradient-to-b from-aff-ivory to-white p-4 shadow-[0_10px_30px_-22px_rgba(172,131,78,0.45)] sm:p-5">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 -z-10 h-44 w-44 rounded-full bg-aff-gold-400/25 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-500 to-transparent"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input.Search
          size="large"
          allowClear
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order number..."
          className="w-full sm:max-w-sm"
          aria-label="Search orders by order number"
        />
        <p
          aria-live="polite"
          className="font-sans text-[13px] text-aff-muted transition-opacity"
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          <span className="font-semibold text-aff-green-900">
            {resultCount}
          </span>{" "}
          {resultCount === 1 ? "order" : "orders"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
        <Select
          value={status}
          onChange={(value) => updateParams({ status: value ?? "" })}
          allowClear
          placeholder="All order statuses"
          className="w-full lg:w-[190px]"
          aria-label="Filter by order status"
          options={ORDER_STATUS_OPTIONS}
        />

        <Select
          value={paymentStatus}
          onChange={(value) => updateParams({ payment: value ?? "" })}
          allowClear
          placeholder="All payment statuses"
          className="w-full lg:w-[200px]"
          aria-label="Filter by payment status"
          options={PAYMENT_STATUS_OPTIONS}
        />

        <Select
          value={commissionState}
          onChange={(value) => updateParams({ commission: value ?? "" })}
          allowClear
          placeholder="All commission states"
          className="w-full sm:col-span-2 lg:col-span-1 lg:w-[210px]"
          aria-label="Filter by commission state"
          options={COMMISSION_STATE_OPTIONS}
        />

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-8 w-fit cursor-pointer items-center gap-1 rounded-full border border-aff-border bg-white px-3 font-sans text-[13px] font-medium text-aff-muted transition-colors hover:border-aff-gold-500 hover:text-aff-green-900"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}