"use client";

// Confirmation step: the affiliate checks the total and the bank details,
// then sends the request. Sending calls the server action requestPayout(),
// which sends only the order ids. The database recalculates the real total.

import { useState } from "react";
import { Alert, Descriptions, Modal, Typography, message } from "antd";
import { requestPayout } from "@/lib/affiliate/payout-actions";
import type { BankSummary } from "@/lib/affiliate/payout-queries";
import { useMarket } from "@/components/providers/market-provider";
import { withApprox, type RateMap } from "@/lib/currency";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // clears the ticked orders in the parent
  orderIds: string[];
  itemsTotalUsd: number;
  adjustmentsUsd: number; // zero or negative
  totalUsd: number;
  bank: BankSummary;
  rates: RateMap;
};

export default function RequestPayoutDialog({
  open,
  onClose,
  onSuccess,
  orderIds,
  itemsTotalUsd,
  adjustmentsUsd,
  totalUsd,
  bank,
  rates,
}: Props) {
  // The currency chosen in the header menu. The payout is always sent in
  // USD; the chosen currency is shown beside it as "approx." only.
  const { market } = useMarket();
  const usd = (n: number) => {
    const v = withApprox(n, "USD", market.currencyCode, rates);
    return v.approx ? `${v.original} (${v.approx})` : v.original;
  };
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (submitting) return; // never close while the request is in flight
    setError(null);
    onClose();
  };

  const handleSend = async () => {
    if (submitting) return; // blocks a double click
    setSubmitting(true);
    setError(null);

    try {
      const result = await requestPayout(orderIds);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      messageApi.success(
        result.requestNumber
          ? `Payout request ${result.requestNumber} sent.`
          : "Payout request sent.",
      );
      onSuccess();
      onClose();
    } catch {
      setError("Network problem. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Confirm payout request"
        open={open}
        onCancel={handleClose}
        onOk={handleSend}
        okText="Send request"
        cancelText="Cancel"
        confirmLoading={submitting}
        cancelButtonProps={{ disabled: submitting }}
        maskClosable={false}
        keyboard={!submitting}
        closable={!submitting}
        width={520}
        destroyOnClose
      >
        <Descriptions
          column={1}
          size="small"
          bordered
          styles={{ label: { width: "45%" } }}
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label="Orders">
            {orderIds.length}
          </Descriptions.Item>
          <Descriptions.Item label="Commission">
            {usd(itemsTotalUsd)}
          </Descriptions.Item>
          {adjustmentsUsd < 0 && (
            <Descriptions.Item label="Refund adjustments">
              {usd(adjustmentsUsd)}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Total">
            <Typography.Text strong>{usd(totalUsd)}</Typography.Text>
          </Descriptions.Item>
        </Descriptions>

        <Typography.Text strong>Payment will be sent to</Typography.Text>
        <Descriptions
          column={1}
          size="small"
          bordered
          styles={{ label: { width: "45%" } }}
          style={{ marginTop: 8, marginBottom: 16 }}
        >
          <Descriptions.Item label="Account holder">
            {bank.accountHolderName}
          </Descriptions.Item>
          <Descriptions.Item label="Bank">
            {bank.bankName} ({bank.bankCountry})
          </Descriptions.Item>
          <Descriptions.Item label="Account">
            {bank.accountMasked}
          </Descriptions.Item>
          <Descriptions.Item label="Payout currency">
            {bank.payoutCurrency}
          </Descriptions.Item>
        </Descriptions>

        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          The amount is calculated in USD. Your bank details are saved with this
          request, so changing them later will not affect it.
        </Typography.Paragraph>

        {error && (
          <Alert
            type="error"
            showIcon
            style={{ marginTop: 16 }}
            message={error}
          />
        )}
      </Modal>
    </>
  );
}
