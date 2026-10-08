"use client";

// Approve / Reject / Mark paid buttons for one request. Which buttons show
// depends on the status. The database checks the status again, so a stale
// page can never move a request to a wrong state.
//
// Proof upload: the browser uploads the file straight to the private
// payout-proofs bucket (storage policy: admin only), then sends only the
// file PATH to markPayoutPaid(). Files never go through the server action.

import { useState } from "react";
import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd";
import { createClient } from "@/lib/supabase/client";
import {
  approvePayout,
  markPayoutPaid,
  rejectPayout,
} from "@/lib/admin/payout-actions";
import type { PayoutStatus } from "@/lib/affiliate/payout-queries";

const MAX_BYTES = 10 * 1024 * 1024; // same limit as the bucket
const EXT_BY_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type Props = {
  requestId: string;
  status: PayoutStatus;
  totalUsd: number;
  payoutCurrency: string;
  totalPayoutAmount: number | null; // used only to prefill the amount
};

type PaidForm = {
  reference: string;
  paidAmount: number;
  paidCurrency: string;
  proof: UploadFile[];
};

export default function PayoutActions({
  requestId,
  status,
  totalUsd,
  payoutCurrency,
  totalPayoutAmount,
}: Props) {
  const [messageApi, contextHolder] = message.useMessage();
  const [busy, setBusy] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  const [paidOpen, setPaidOpen] = useState(false);
  const [paidError, setPaidError] = useState<string | null>(null);
  const [form] = Form.useForm<PaidForm>();

  // Nothing to do for finished requests.
  if (status === "paid" || status === "rejected") return null;

  /* ---------------- Approve ---------------- */
  const handleApprove = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await approvePayout(requestId);
      if (res.ok) messageApi.success("Request approved.");
      else messageApi.error(res.error);
    } catch {
      messageApi.error("Network problem. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- Reject ---------------- */
  const handleReject = async () => {
    if (busy) return;
    const reason = rejectReason.trim();
    if (reason.length < 3) {
      setRejectError(
        "Please give the affiliate a reason (at least 3 characters).",
      );
      return;
    }
    setBusy(true);
    setRejectError(null);
    try {
      const res = await rejectPayout(requestId, reason);
      if (res.ok) {
        messageApi.success("Request rejected.");
        setRejectOpen(false);
        setRejectReason("");
      } else {
        setRejectError(res.error);
      }
    } catch {
      setRejectError("Network problem. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- Mark paid ---------------- */
  const handleMarkPaid = async () => {
    if (busy) return;

    let values: PaidForm;
    try {
      values = await form.validateFields();
    } catch {
      return; // antd shows the field errors
    }

    const file = values.proof?.[0]?.originFileObj;
    if (!file) {
      setPaidError("Choose the payment proof file.");
      return;
    }
    const ext = EXT_BY_TYPE[file.type];
    if (!ext) {
      setPaidError("The proof must be a PDF, JPG, PNG or WebP file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setPaidError("The proof file is too large (10 MB max).");
      return;
    }

    setBusy(true);
    setPaidError(null);

    // Safe file name: only letters, digits and dashes, plus a timestamp.
    const path = `${requestId}/proof-${Date.now()}.${ext}`;
    const supabase = createClient();
    let uploaded = false;

    try {
      const { error: uploadError } = await supabase.storage
        .from("payout-proofs")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        setPaidError("Could not upload the proof file. Please try again.");
        return;
      }
      uploaded = true;

      const res = await markPayoutPaid({
        requestId,
        reference: values.reference,
        proofPath: path,
        paidAmount: values.paidAmount,
        paidCurrency: values.paidCurrency,
      });

      if (res.ok) {
        messageApi.success("Marked as paid.");
        setPaidOpen(false);
        form.resetFields();
      } else {
        setPaidError(res.error);
        // The request was not marked paid, so remove the file we just
        // uploaded instead of leaving an orphan in the bucket.
        await supabase.storage.from("payout-proofs").remove([path]);
      }
    } catch {
      setPaidError("Network problem. Please try again.");
      if (uploaded) {
        await supabase.storage.from("payout-proofs").remove([path]);
      }
    } finally {
      setBusy(false);
    }
  };

  // Prefill: the indicative amount, or the USD total when paying in USD.
  const suggestedAmount =
    totalPayoutAmount ?? (payoutCurrency === "USD" ? totalUsd : undefined);

  return (
    <>
      {contextHolder}

      <Space wrap>
        {status === "requested" && (
          <Popconfirm
            title="Approve this request?"
            description="The orders stay locked until you mark it paid or reject it."
            okText="Approve"
            onConfirm={handleApprove}
            disabled={busy}
          >
            <Button type="primary" loading={busy} disabled={busy}>
              Approve
            </Button>
          </Popconfirm>
        )}

        {status === "approved" && (
          <Button
            type="primary"
            disabled={busy}
            onClick={() => {
              setPaidError(null);
              setPaidOpen(true);
            }}
          >
            Mark as paid
          </Button>
        )}

        <Button
          danger
          disabled={busy}
          onClick={() => {
            setRejectError(null);
            setRejectOpen(true);
          }}
        >
          Reject
        </Button>
      </Space>

      {/* ---------- Reject dialog ---------- */}
      <Modal
        title="Reject payout request"
        open={rejectOpen}
        onCancel={() => !busy && setRejectOpen(false)}
        onOk={handleReject}
        okText="Reject request"
        okButtonProps={{ danger: true }}
        confirmLoading={busy}
        cancelButtonProps={{ disabled: busy }}
        maskClosable={false}
        closable={!busy}
        keyboard={!busy}
        destroyOnClose
      >
        <p style={{ marginTop: 0 }}>
          The affiliate will see this reason, and the orders become available to
          request again.
        </p>
        <Input.TextArea
          rows={2}
          showCount
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejecting"
          style={{
            borderRadius: "0px",
            border: "1px solid #d9d9d9",
          }}
        />{" "}
        {rejectError && (
          <Alert
            type="error"
            showIcon
            style={{ marginTop: 12 }}
            message={rejectError}
          />
        )}
      </Modal>

      {/* ---------- Mark paid dialog ---------- */}
      <Modal
        title="Mark as paid"
        open={paidOpen}
        onCancel={() => !busy && setPaidOpen(false)}
        onOk={handleMarkPaid}
        okText="Mark as paid"
        confirmLoading={busy}
        cancelButtonProps={{ disabled: busy }}
        maskClosable={false}
        closable={!busy}
        keyboard={!busy}
        destroyOnClose
      >
        <Form<PaidForm>
          form={form}
          layout="vertical"
          initialValues={{
            paidAmount: suggestedAmount,
            paidCurrency: payoutCurrency,
          }}
        >
          <Form.Item
            name="reference"
            label="Payment reference"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Enter the payment reference",
              },
              { max: 200, message: "Too long (200 characters max)" },
            ]}
          >
            <Input placeholder="Bank transaction ID or reference" />
          </Form.Item>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Form.Item
              name="paidAmount"
              label="Amount sent"
              style={{ flex: "2 1 160px", marginBottom: 24 }}
              rules={[{ required: true, message: "Enter the amount you sent" }]}
            >
              <InputNumber min={0.01} precision={2} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="paidCurrency"
              label="Currency"
              style={{ flex: "1 1 100px", marginBottom: 24 }}
              normalize={(v: string) => (v ?? "").toUpperCase()}
              rules={[
                { required: true, message: "Required" },
                { pattern: /^[A-Za-z]{3}$/, message: "3 letters, e.g. USD" },
              ]}
            >
              <Input maxLength={3} />
            </Form.Item>
          </div>

          <Form.Item
            name="proof"
            label="Payment proof (PDF, JPG, PNG or WebP, 10 MB max)"
            valuePropName="fileList"
            getValueFromEvent={(e: { fileList?: UploadFile[] }) =>
              e?.fileList ?? []
            }
            rules={[{ required: true, message: "Upload the payment proof" }]}
          >
            <Upload
              maxCount={1}
              beforeUpload={() => false} // keep the file in the browser; we upload it ourselves
              accept=".pdf,.jpg,.jpeg,.png,.webp"
            >
              <Button>Choose file</Button>
            </Upload>
          </Form.Item>
        </Form>

        {paidError && <Alert type="error" showIcon message={paidError} />}
      </Modal>
    </>
  );
}
