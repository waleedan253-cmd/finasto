"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  AutoComplete,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
} from "antd";
import { Mail } from "lucide-react";
import {
  createStockist,
  updateStockist,
  type StockistInput,
} from "@/lib/admin/stockist-actions";
import type {
  StockistDetail,
  StockistFieldSuggestions,
} from "@/lib/admin/stockist-queries";
import { StockistStatusBadge } from "@/components/admin/stockists/stockist-status-badge";

// Shared create/edit form (admin/stockists/new and admin/stockists/[id]).
// Same layout as product-form.tsx: one page, two columns, no page scroll
// trick and no fixed bottom bar.
//   Left  = who the stockist IS (details, internal notes).
//   Right = account state + save, sticky while the admin scrolls.
//
// Country and Region / City are free text with suggestions: the admin can
// pick a value already used by another stockist, or type a new one, which
// is saved with the stockist and suggested next time.
//
// Email is NOT editable in edit mode: it is the stockist's login identity
// in Supabase Auth, and changing it here would desync it from auth.users.

type Status = "active" | "inactive";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  defaultProfitPercent: number;
  status: Status;
  notes: string;
};

const FORM_FIELDS: (keyof FormValues)[] = [
  "name",
  "email",
  "phone",
  "country",
  "region",
  "defaultProfitPercent",
  "status",
  "notes",
];

const trimOrNull = (s?: string) => (s && s.trim() !== "" ? s.trim() : null);

const filterOption = (
  input: string,
  option?: { value?: string | number | null },
) =>
  String(option?.value ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

export function StockistForm({
  mode,
  stockist,
  suggestions,
}: {
  mode: "create" | "edit";
  stockist: StockistDetail | null;
  suggestions: StockistFieldSuggestions;
}) {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Live status for the badge in the sidebar.
  const status: Status =
    Form.useWatch("status", form) ??
    (stockist?.status === "active" || !stockist ? "active" : "inactive");

  const initialValues: FormValues = {
    name: stockist?.name ?? "",
    email: stockist?.email ?? "",
    phone: stockist?.phone ?? "",
    country: stockist?.country ?? "",
    region: stockist?.region ?? "",
    defaultProfitPercent: stockist?.defaultProfitPercent ?? 10,
    // New stockists start active. Anything that is not "active" is shown
    // as inactive, so saving never silently activates a paused account.
    status: !stockist || stockist.status === "active" ? "active" : "inactive",
    notes: stockist?.notes ?? "",
  };

  function handleFinish(values: FormValues) {
    setFormError(null);

    const input: StockistInput = {
      name: values.name,
      email: values.email,
      phone: trimOrNull(values.phone),
      country: trimOrNull(values.country),
      region: trimOrNull(values.region),
      defaultProfitPercent: values.defaultProfitPercent ?? 0,
      notes: trimOrNull(values.notes),
      status: values.status,
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createStockist(input)
          : await updateStockist(stockist!.id, input);

      if (result.success) {
        router.push("/admin/stockists");
        router.refresh();
        return;
      }

      setFormError(result.error);

      // Show server-side field errors inline under the matching field.
      const serverErrors = result.fieldErrors ?? {};
      const mapped = Object.entries(serverErrors)
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
            <Card title="Stockist details">
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Enter the stockist's name",
                  },
                  { max: 120, message: "Keep it under 120 characters" },
                ]}
              >
                <Input size="large" placeholder="e.g. Ayu Wellness Store" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Enter an email address" },
                      { type: "email", message: "Enter a valid email" },
                    ]}
                    extra={
                      mode === "edit"
                        ? "Email is the stockist's login and can't be changed here."
                        : undefined
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
                      placeholder="stockist@example.com"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[{ max: 30, message: "Max 30 characters" }]}
                  >
                    <Input placeholder="Optional" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Country"
                    name="country"
                    rules={[{ max: 60, message: "Max 60 characters" }]}
                  >
                    <AutoComplete
                      allowClear
                      options={suggestions.country.map((v) => ({ value: v }))}
                      placeholder="Pick one or type a new country"
                      filterOption={filterOption}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Region / City"
                    name="region"
                    rules={[{ max: 60, message: "Max 60 characters" }]}
                  >
                    <AutoComplete
                      allowClear
                      options={suggestions.region.map((v) => ({ value: v }))}
                      placeholder="Pick one or type a new region"
                      filterOption={filterOption}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Default profit %"
                name="defaultProfitPercent"
                rules={[
                  { required: true, message: "Enter a profit percentage" },
                ]}
                extra="Applied automatically on products with no override."
                className="!mb-0"
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={1}
                  suffix="%"
                  className="!w-full"
                />
              </Form.Item>
            </Card>

            <Card
              title="Internal notes"
              extra={
                <span className="text-[13px] text-neutral-500">
                  Visible to admin only, never shown to the stockist
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
                extra={<StockistStatusBadge status={status} />}
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
                    An invite email is sent automatically when the stockist is
                    created, so they can set their own password and log in.
                  </p>
                )}

                <Space.Compact block>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => router.push("/admin/stockists")}
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
                </Space.Compact>
              </Card>
            </Space>
          </div>
        </Col>
      </Row>
    </Form>
  );
}
