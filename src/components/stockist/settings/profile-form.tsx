"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Col, Form, Input, Row, message } from "antd";
import { Mail, Percent } from "lucide-react";
import { saveMyStockistProfile } from "@/lib/stockist/settings-actions";
import { PhoneInput, phoneRule } from "@/components/ui/phone-input";
import {
  COUNTRIES,
  CountrySelect,
  countryName,
} from "@/components/ui/country-select";
import type { StockistProfile } from "@/lib/stockist/settings-queries";

// Profile card on the stockist Settings page. Same look as the affiliate
// profile card. The stockist fills in the details the admin left empty:
// phone, country and region (and may correct the business name).
//
// Email is the login identity, so it is shown but locked. The discount rate
// is set by the admin and shown read-only. Status, notes and the login link
// never appear here, and the save action cannot change them anyway.

type FormValues = {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  region: string;
  discount: string;
};

const FORM_FIELDS: (keyof FormValues)[] = [
  "name",
  "phone",
  "countryCode",
  "region",
];

// The database stores the country NAME (the admin pages show names), the
// picker works with the ISO code. Convert once for the starting value.
function codeFromName(name: string | null): string {
  if (!name) return "";
  const wanted = name.trim().toLowerCase();
  return COUNTRIES.find((c) => c.name.toLowerCase() === wanted)?.code ?? "";
}

export function StockistProfileForm({ profile }: { profile: StockistProfile }) {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const incomplete = !profile.phone || !profile.country;

  const initialValues: FormValues = {
    name: profile.name,
    email: profile.email,
    phone: profile.phone ?? "",
    countryCode: codeFromName(profile.country),
    region: profile.region ?? "",
    discount: `${profile.discountPercent}%`,
  };

  function handleFinish(values: FormValues) {
    setFormError(null);

    startTransition(async () => {
      const result = await saveMyStockistProfile({
        name: values.name,
        phone: values.phone?.trim() || null,
        country: values.countryCode ? countryName(values.countryCode) : null,
        region: values.region?.trim() || null,
      });

      if (result.success) {
        message.success("Profile saved");
        router.refresh();
        return;
      }

      setFormError(result.error);

      // Show server-side field errors inline under the matching field.
      // The action calls the country "country"; the form calls it
      // "countryCode".
      const mapped = Object.entries(result.fieldErrors ?? {})
        .map(([key, messages]) => ({
          name: (key === "country" ? "countryCode" : key) as keyof FormValues,
          errors: messages,
        }))
        .filter((f) => FORM_FIELDS.includes(f.name));
      if (mapped.length > 0) form.setFields(mapped);
    });
  }

  return (
    <Card
      className="finasto-card"
      bordered={false}
      style={{ background: "var(--color-white)" }}
      title="Profile"
      extra={
        <span className="text-[13px] text-warm-gray">Your contact details</span>
      }
    >
      <Form<FormValues>
        form={form}
        layout="vertical"
        // requiredMark="optional"
        initialValues={initialValues}
        onFinish={handleFinish}
        scrollToFirstError={{ behavior: "smooth", block: "center" }}
        disabled={isPending}
      >
        {incomplete && (
          <Alert
            type="warning"
            showIcon
            message="Complete your profile"
            description="Add your phone number and country so the Finasto team can reach you."
            className="mb-4"
          />
        )}

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

        <Row gutter={[16, 8]}>
          {/* Row 1: Name + Email */}
          <Col xs={24} md={12}>
            <Form.Item label="Name" name="name">
              <Input disabled size="middle" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Email" name="email">
              <Input
                prefix={<Mail className="h-4 w-4 text-warm-gray" />}
                disabled
                size="middle"
              />
            </Form.Item>
          </Col>

          {/* Row 2: Discount + Region */}
          <Col xs={24} md={12}>
            <Form.Item label="Discount rate" name="discount">
              <Input disabled size="middle" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Region / City"
              name="region"
              rules={[{ max: 60, message: "Max 60 characters" }]}
            >
              <Input placeholder="e.g. Punjab, Lahore" size="middle" />
            </Form.Item>
          </Col>

          {/* Row 3: Phone + Country */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Phone"
              name="phone"
              rules={[
                { required: true, message: "Enter your phone number" },
                phoneRule,
              ]}
            >
              <PhoneInput />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Country"
              name="countryCode"
              rules={[{ required: true, message: "Select your country" }]}
            >
              <CountrySelect />
            </Form.Item>
          </Col>
        </Row>

        {/* Bottom-right button */}
        <div className="flex justify-end mt-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            size="large"
          >
            Save profile
          </Button>
        </div>
      </Form>
    </Card>
  );
}
