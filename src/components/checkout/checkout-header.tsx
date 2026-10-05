"use client";

import { Typography } from "antd";

export function CheckoutHeader() {
  return (
    <>
      <Typography.Title
        level={1}
        className="!font-display !text-[32px] !leading-tight !text-espresso sm:!text-[38px]"
      >
        Checkout
      </Typography.Title>
      <Typography.Paragraph className="!mt-1 !font-sans !text-[14px] !text-warm-gray">
        Review your order and confirm your details — no account required.
      </Typography.Paragraph>
    </>
  );
}
