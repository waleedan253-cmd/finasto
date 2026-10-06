"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  message,
} from "antd";
import { Mail } from "lucide-react";
import {
  createAffiliate,
  updateAffiliate,
  type AffiliateInput,
} from "@/lib/admin/affiliate-actions";
import type {
  AffiliateDetail,
  AffiliateStatus,
} from "@/lib/admin/affiliate-queries";
import { AffiliateStatusBadge } from "@/components/admin/affiliates/affiliate-status-badge";

// Shared create/edit form (admin/affiliates/new and admin/affiliates/[id]).
// Same two-column layout as stockist-form.tsx.
//   Left  = who the affiliate IS (name, email, stockist, internal notes).
//   Right = account state + save, sticky while the admin scrolls.
//
// The admin only enters name, email and an optional stockist. Phone,
// country and region are filled in by the affiliate from their own
// dashboard settings, so they are NOT inputs here. In edit mode they
// appear read-only so the admin can see what the affiliate has entered.
//
// Email is NOT editable in edit mode: it is the affiliate's login
// identity in Supabase Auth.

type FormValues = {
  name: string;
  email: string;
  stockistId?: string; // undefined = unassigned (converted to null on save)
  status: AffiliateStatus;
  notes: string;
  commissionPercent: number;
};

const FORM_FIELDS: (keyof FormValues)[] = [
  "name",
  "email",
  "stockistId",
  "status",
  "notes",
  "commissionPercent",
];

const trimOrNull = (s?: string) => (s && s.trim() !== "" ? s.trim() : null);

export function AffiliateForm({
  mode,
  affiliate,
  stockistOptions,
}: {
  mode: "create" | "edit";
  affiliate: AffiliateDetail | null;
  stockistOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Live status for the badge in the sidebar.
  const status: AffiliateStatus =
    Form.useWatch("status", form) ?? affiliate?.status ?? "active";

  // The currently assigned stockist may be paused, so it would be missing
  // from the active-only options. Keep it in the list so the Select shows
  // its name instead of a raw id.
  const options = [...stockistOptions];
  if (
    affiliate?.stockistId &&
    affiliate.stockistName &&
    !options.some((o) => o.id === affiliate.stockistId)
  ) {
    options.unshift({ id: affiliate.stockistId, name: affiliate.stockistName });
  }

  const initialValues: FormValues = {
    name: affiliate?.name ?? "",
    email: affiliate?.email ?? "",
    stockistId: affiliate?.stockistId ?? undefined,
    status: affiliate?.status ?? "active",
    notes: affiliate?.notes ?? "",
    commissionPercent: affiliate?.commissionPercent ?? 10,
  };

  function handleFinish(values: FormValues) {
    setFormError(null);

    const input: AffiliateInput = {
      name: values.name,
      email: values.email,
      stockistId: values.stockistId ?? null, // cleared Select => unassigned
      notes: trimOrNull(values.notes),
      status: values.status,
      commissionPercent: values.commissionPercent ?? 0,
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createAffiliate(input)
          : await updateAffiliate(affiliate!.id, input);

      if (result.success) {
        if (result.inviteError) {
          message.warning(
            "Affiliate created, but the invite email failed. Use “Resend invite” from the list.",
            6,
          );
        } else if (mode === "create") {
          message.success("Affiliate created and invite sent");
        }
        router.push("/admin/affiliates");
        router.refresh();
        return;
      }

      setFormError(result.error);

      // Show server-side field errors inline under the matching field.
      const mapped = Object.entries(result.fieldErrors ?? {})
        .filter(([key]) => (FORM_FIELDS as string[]).includes(key))
        .map(([key, messages]) => ({
          name: key as keyof FormValues,
          errors: messages,
        }));
      if (mapped.length > 0) form.setFields(mapped);
    });
  }

  return (
    <Form<FormValues>
      form={form}
      layout="vertical"
      requiredMark="optional"
      initialValues={initialValues}
      onFinish={handleFinish}
      scrollToFirstError={{ behavior: "smooth", block: "center" }}
      disabled={isPending}
    >
      {formError && (
        <Alert
          type="error"
          showIcon
          closable
          message={formError}
          onClose={() => setFormError(null)}
          className="mb-4"
        />
      )}

      <Row gutter={[16, 16]} align="top">
        {/* ─────────── Main column ─────────── */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={16} className="w-full">
            <Card title="Affiliate details">
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Enter the affiliate's name",
                  },
                  { max: 120, message: "Keep it under 120 characters" },
                ]}
              >
                <Input size="large" placeholder="e.g. Sara Khan" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Enter an email address" },
                  { type: "email", message: "Enter a valid email" },
                ]}
                extra={
                  mode === "edit"
                    ? "Email is the affiliate's login and can't be changed here."
                    : "The invite email is sent to this address."
                }
              >
                <Input
                  prefix={
                    <Mail
                      className="h-4 w-4 text-neutral-400"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                  }
                  disabled={mode === "edit"}
                  placeholder="affiliate@example.com"
                />
              </Form.Item>

              <Form.Item
                label="Commission %"
                name="commissionPercent"
                rules={[
                  { required: true, message: "Enter a commission percentage" },
                ]}
                extra="The share of each sale this affiliate earns."
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.5}
                  precision={2}
                  suffix="%"
                  className="!w-full"
                />
              </Form.Item>

              <Form.Item
                label="Stockist"
                name="stockistId"
                extra="Optional. Leave empty to keep this affiliate unassigned."
                className="!mb-0"
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="No stockist (unassigned)"
                  options={options.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                />
              </Form.Item>
            </Card>

            {mode === "edit" && affiliate && (
              <Card
                title="Affiliate profile"
                extra={
                  <span className="text-[13px] text-neutral-500">
                    Filled in by the affiliate, read-only here
                  </span>
                }
              >
                <dl className="grid grid-cols-1 gap-3 text-[14px] sm:grid-cols-3">
                  <ProfileField label="Phone" value={affiliate.phone} />
                  <ProfileField label="Country" value={affiliate.country} />
                  <ProfileField
                    label="Region / City"
                    value={affiliate.region}
                  />
                </dl>
              </Card>
            )}

            {mode === "edit" && affiliate && (
              <Card
                title="Bank details"
                extra={
                  <span className="text-[13px] text-neutral-500">
                    Filled in by the affiliate, read-only here
                  </span>
                }
              >
                {affiliate.bankDetails ? (
                  <dl className="grid grid-cols-1 gap-3 text-[14px] sm:grid-cols-2">
                    <ProfileField
                      label="Account holder"
                      value={affiliate.bankDetails.accountHolderName}
                    />
                    <ProfileField
                      label="Bank name"
                      value={affiliate.bankDetails.bankName}
                    />
                    <ProfileField
                      label="Bank country"
                      value={affiliate.bankDetails.bankCountry}
                    />
                    <ProfileField
                      label="Account / IBAN"
                      value={affiliate.bankDetails.accountNumber}
                    />
                    <ProfileField
                      label="SWIFT / BIC"
                      value={affiliate.bankDetails.swiftBic}
                    />
                    <ProfileField
                      label="Routing code"
                      value={affiliate.bankDetails.routingCode}
                    />
                    <ProfileField
                      label="Payout currency"
                      value={affiliate.bankDetails.payoutCurrency}
                    />
                  </dl>
                ) : (
                  <p className="text-[14px] text-neutral-400">
                    Not provided yet
                  </p>
                )}
              </Card>
            )}

            <Card
              title="Internal notes"
              extra={
                <span className="text-[13px] text-neutral-500">
                  Visible to admin only, never shown to the affiliate
                </span>
              }
            >
              <Form.Item
                name="notes"
                rules={[{ max: 2000, message: "Max 2000 characters" }]}
                className="!mb-0"
              >
                <Input.TextArea
                  rows={4}
                  showCount
                  maxLength={2000}
                  placeholder="Optional"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Card>
          </Space>
        </Col>

        {/* ─────────── Sticky sidebar ─────────── */}
        <Col xs={24} lg={8}>
          <div className="lg:sticky lg:top-4">
            <Space direction="vertical" size={16} className="w-full">
              <Card
                title="Account"
                extra={<AffiliateStatusBadge status={status} />}
              >
                <Form.Item label="Status" name="status">
                  <Select
                    options={[
                      { value: "active", label: "Active" },
                      {
                        value: "inactive",
                        label: "Inactive (paused, not deleted)",
                      },
                    ]}
                  />
                </Form.Item>

                {mode === "create" && (
                  <p className="mb-4 text-[13px] leading-relaxed text-neutral-500">
                    An invite email is sent automatically when the affiliate is
                    created. They set their own password, then add their phone,
                    country and other details from their dashboard settings.
                  </p>
                )}

                {mode === "edit" && affiliate && !affiliate.hasAccount && (
                  <p className="mb-4 text-[13px] leading-relaxed text-neutral-500">
                    No login yet. Use “Resend invite” from the affiliates list.
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push("/admin/affiliates")}
                    disabled={isPending}
                    style={{ width: "35%" }}
                    size="large"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isPending}
                    style={{ width: "65%" }}
                    size="large"
                  >
                    {mode === "create" ? "Create & invite" : "Save changes"}
                  </Button>
                </div>
              </Card>
            </Space>
          </div>
        </Col>
      </Row>
    </Form>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <dt className="text-[12px] text-neutral-500">{label}</dt>
      <dd className={value ? "text-neutral-900" : "text-neutral-400"}>
        {value || "Not provided yet"}
      </dd>
    </div>
  );
}
