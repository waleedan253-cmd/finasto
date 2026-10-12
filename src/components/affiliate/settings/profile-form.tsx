"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Col, Form, Input, Row, message } from "antd";
import { Mail } from "lucide-react";
import {
  completeMyProfile,
  updateMyProfile,
} from "@/lib/affiliate/settings-actions";
import { PhoneInput, phoneRule } from "@/components/ui/phone-input";
import { CountrySelect, countryName } from "@/components/ui/country-select";
import { countryToCurrency } from "@/lib/currency";
import type { MySettings } from "@/lib/affiliate/settings-queries";

// Profile card on the affiliate Settings page. The affiliate fills in the
// details the admin deliberately left empty: phone, country and region.
// Email is the login identity, so it is shown but locked. Commission,
// status and stockist are admin-only and do not appear here at all.

type FormValues = {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  region: string;
};

const FORM_FIELDS: (keyof FormValues)[] = [
  "name",
  "phone",
  "countryCode",
  "region",
];

export function ProfileForm({
  settings,
}: {
  settings: Pick<
    MySettings,
    | "name"
    | "email"
    | "phone"
    | "countryCode"
    | "displayCurrency"
    | "profileLocked"
    | "region"
  >;
}) {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const locked = settings.profileLocked;

  const initialValues: FormValues = {
    name: settings.name ?? "",
    email: settings.email,
    phone: settings.phone ?? "",
    countryCode: settings.countryCode ?? "",
    region: settings.region ?? "",
  };

  // Preview only. The database sets the real currency from the country.
  const watchedCountry = Form.useWatch("countryCode", form);
  const previewCurrency = countryToCurrency(watchedCountry);

  function handleFinish(values: FormValues) {
    setFormError(null);

    startTransition(async () => {
      // First save: username, phone and country go through one locked,
      // one-time action. After that only name and region can change.
      const first = locked
        ? null
        : await completeMyProfile({
            name: values.name,
            phone: values.phone,
            countryCode: values.countryCode,
            countryName: countryName(values.countryCode),
          });
      if (first?.success) router.refresh();

      const result =
        first && !first.success
          ? first
          : await updateMyProfile({
              region: values.region ?? "",
            });

      if (result.success) {
        message.success("Profile saved");
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
    <Card
      title="Profile"
      extra={
        <span className="text-[13px] text-neutral-500">
          Your contact details
        </span>
      }
    >
      <Form<FormValues>
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={initialValues}
        onFinish={handleFinish}
        scrollToFirstError={{ behavior: "smooth", block: "center" }}
        disabled={isPending}
      >
        {!locked && (
          <Alert
            type="warning"
            showIcon
            message="Complete your profile"
            description="Choose your username, phone number and country carefully. They can only be set once. Your country also decides the currency your prices are shown in."
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

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: !locked, message: "Choose a name" }]}
          extra={
            locked
              ? "Your name is locked."
              : "Letters, numbers and underscore. Cannot be changed later."
          }
        >
          <Input
            disabled={locked}
            maxLength={30}
            placeholder="e.g. ali_sales"
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          extra="Your email is your login and can't be changed here."
        >
          <Input
            prefix={
              <Mail
                className="h-4 w-4 text-neutral-400"
                strokeWidth={1.6}
                aria-hidden="true"
              />
            }
            disabled
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Phone"
              name="phone"
              rules={[
                { required: !locked, message: "Enter your phone number" },
                phoneRule,
              ]}
              extra={
                locked
                  ? "Your phone number is locked."
                  : "Cannot be changed later."
              }
            >
              <PhoneInput disabled={locked} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Country"
              name="countryCode"
              rules={[{ required: !locked, message: "Select your country" }]}
              extra={
                locked
                  ? `Prices are shown in ${settings.displayCurrency ?? "USD"}.`
                  : `Prices will be shown in ${previewCurrency}. Cannot be changed later.`
              }
            >
              <CountrySelect disabled={locked} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Region / City"
          name="region"
          rules={[{ max: 60, message: "Max 60 characters" }]}
        >
          <Input placeholder="e.g. Punjab, Lahore" />
        </Form.Item>

        <div className="flex justify-end">
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
