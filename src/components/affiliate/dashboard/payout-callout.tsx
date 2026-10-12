"use client";

// "You have $X ready" banner with a Request payout button.
//
// Same look as the rest of the dashboard: Ant Design Card, theme colors
// and white text. It is a client component because the chosen currency
// comes from useMarket().
//
// Shows only when something is available to request. When the net
// amount (after refund adjustments) is zero or negative it renders
// nothing, so the affiliate is never shown a misleading figure. The
// button only goes to the Payout Requests page; the request itself is
// made there.
//
// Amounts stay USD. The currency chosen in the header menu is shown
// beside them as "approx." (same rule as withApprox).

import { useRouter } from "next/navigation";
import { Button, Card, Typography } from "antd";

import { withApprox, type RateMap } from "@/lib/currency";

const WHITE = "var(--color-white)";
const SOFT_WHITE = "rgba(255, 255, 255, 0.75)";

export function PayoutCallout({
  availableUsd,
  canRequestPayout,
  rates,
  currency,
  // Change this if your Payout Requests page lives at a different path.
  href = "/affiliate/payouts",
}: {
  availableUsd: number;
  canRequestPayout: boolean;
  rates: RateMap;
  currency: string;
  href?: string;
}) {
  const router = useRouter();

  if (!canRequestPayout || !(availableUsd > 0)) return null;

  const amount = withApprox(availableUsd, "USD", currency, rates);

  return (
    <Card
      size="small"
      style={{
        // backgroundColor: "var(--color-espresso)",
        borderColor: "var(--color-copper)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Typography.Text
            strong
            style={{ fontSize: 16, color: "var(--color-copper)" }}
          >
            You have {amount.original} ready
            {amount.approx ? ` (${amount.approx})` : ""}
          </Typography.Text>
          <Typography.Text
            style={{ display: "block", fontSize: 12, color: "#321e18" }}
          >
            After the refund window, minus any refund adjustments.
          </Typography.Text>
        </div>

        <Button
          href={href}
          onClick={(e) => {
            e.preventDefault();
            router.push(href);
          }}
          style={{
            backgroundColor: "var(--color-espresso)",

            color: WHITE,
            fontWeight: 500,
          }}
        >
          Request payout
        </Button>
      </div>
    </Card>
  );
}
