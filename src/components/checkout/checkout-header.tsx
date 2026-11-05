// "use client";

// import { Typography } from "antd";

// export function CheckoutHeader() {
//   return (
//     <>
//       <Typography.Title
//         level={1}
//         className="!font-display !text-[32px] !leading-tight !text-espresso sm:!text-[38px]"
//       >
//         Checkout
//       </Typography.Title>
//       <Typography.Paragraph className="!mt-1 !font-sans !text-[14px] !text-warm-gray">
//         Review your order and confirm your details — no account required.
//       </Typography.Paragraph>
//     </>
//   );
// }
"use client";

import { Typography } from "antd";

export function CheckoutHeader() {
  return (
    <div className="text-center sm:text-left">
      <span className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-copper">
        <span className="h-px w-6 bg-copper/60" aria-hidden="true" />
        Almost there
      </span>
      <Typography.Title
        level={1}
        className="!mb-0 !mt-2 !font-display !text-[32px] !leading-tight !text-espresso sm:!text-[42px]"
      >
        Checkout
      </Typography.Title>
      <Typography.Paragraph className="!mb-0 !mt-2 !font-sans !text-[14px] !leading-relaxed !text-warm-gray sm:!text-[15px]">
        Review your order and confirm your details — no account required.
      </Typography.Paragraph>
    </div>
  );
}