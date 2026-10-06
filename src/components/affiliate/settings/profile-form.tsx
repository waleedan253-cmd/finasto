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
  Row,
  message,
} from "antd";
import { Mail } from "lucide-react";
import { updateMyProfile } from "@/lib/affiliate/settings-actions";
import type { MySettings } from "@/lib/affiliate/settings-queries";

// Profile card on the affiliate Settings page. The affiliate fills in the
// details the admin deliberately left empty: phone, country and region.
// Email is the login identity, so it is shown but locked. Commission,
// status and stockist are admin-only and do not appear here at all.

type FormValues = {
  name: string;
  email: string;
  phone: string;
  country: string;
  region: string;
};

const FORM_FIELDS: (keyof FormValues)[] = [
  "name",
  "phone",
  "country",
  "region",
];

const filterOption = (
  input: string,
  option?: { value?: string | number | null },
) =>
  String(option?.value ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

export function ProfileForm({
  settings,
}: {
  settings: Pick<
    MySettings,
    "name" | "email" | "phone" | "country" | "region" | "countries"
  >;
}) {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const initialValues: FormValues = {
    name: settings.name,
    email: settings.email,
    phone: settings.phone ?? "",
    country: settings.country ?? "",
    region: settings.region ?? "",
  };

  const incomplete = !settings.phone?.trim() || !settings.country?.trim();

  function handleFinish(values: FormValues) {
    setFormError(null);

    startTransition(async () => {
      const result = await updateMyProfile({
        name: values.name,
        phone: values.phone ?? "",
        country: values.country ?? "",
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
        {incomplete && (
          <Alert
            type="info"
            showIcon
            message="Please add your phone number and country to complete your profile."
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
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Enter your name",
            },
            { max: 120, message: "Keep it under 120 characters" },
          ]}
        >
          <Input size="large" placeholder="Your full name" />
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
                {
                  pattern: /^[0-9+()\-.\s]{5,30}$/,
                  message: "Enter a valid phone number",
                },
              ]}
              extra="Include your country code, e.g. +92 300 1234567"
            >
              <Input placeholder="+92 300 1234567" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Country"
              name="country"
              rules={[{ max: 60, message: "Max 60 characters" }]}
            >
              <AutoComplete
                allowClear
                options={settings.countries.map((v) => ({ value: v }))}
                placeholder="Pick one or type your country"
                filterOption={filterOption}
              />
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
