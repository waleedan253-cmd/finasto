"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Col, Form, Input, Row, message } from "antd";
import { Send } from "lucide-react";
import { submitStockistRequest } from "@/lib/stockist/stockist-requests-actions";

// Submit form for "assign this affiliate to me". The stockist types the
// affiliate's name and email and a description; there are no dropdowns, so a
// stockist never sees other stockists or their affiliates. Built with antd
// Form, Row and Col: name and email side by side from the md breakpoint up,
// one stacked column on mobile, and a full-width button on small screens.
// The database makes the final checks and never says whether the email
// exists.

type FormValues = {
  affiliateName?: string;
  affiliateEmail?: string;
  description?: string;
};

const DESCRIPTION_MAX = 500;

export function RequestForm() {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  function onFinish(values: FormValues) {
    setFormError(null);

    startTransition(async () => {
      const result = await submitStockistRequest({
        affiliateName: values.affiliateName ?? "",
        affiliateEmail: values.affiliateEmail ?? "",
        description: values.description ?? "",
      });

      if (result.success) {
        message.success("Request sent. Finasto will review it.");
        form.resetFields();
        router.refresh();
        return;
      }

      // Show field-level messages under the matching inputs.
      if (result.fieldErrors) {
        form.setFields(
          Object.entries(result.fieldErrors).map(([name, errors]) => ({
            name: name as keyof FormValues,
            errors,
          })),
        );
      }
      setFormError(result.error);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
      <h2 className="font-display text-[20px] leading-tight text-espresso">
        Request an affiliate
      </h2>
      <p className="mb-5 mt-1 font-sans text-[13px] text-warm-gray">
        Enter the affiliate&apos;s details and tell us why they should be
        assigned to you. Finasto reviews every request, and nothing changes
        until an admin approves it.
      </p>

      {formError && (
        <Alert
          type="error"
          showIcon
          closable
          onClose={() => setFormError(null)}
          message={formError}
          className="mb-4"
        />
      )}

      <Form<FormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        disabled={pending}
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Affiliate name"
              name="affiliateName"
              rules={[
                { required: true, message: "Enter the affiliate's name" },
                { min: 2, message: "Enter at least 2 characters" },
                { max: 100, message: "Keep the name under 100 characters" },
              ]}
            >
              <Input size="large" placeholder="Full name" autoComplete="off" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Affiliate email"
              name="affiliateEmail"
              rules={[
                { required: true, message: "Enter the affiliate's email" },
                { type: "email", message: "Enter a valid email address" },
                { max: 254, message: "That email is too long" },
              ]}
            >
              <Input
                size="large"
                type="email"
                inputMode="email"
                placeholder="name@example.com"
                autoComplete="off"
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: "Please add a description" },
                {
                  validator: (_, value?: string) =>
                    !value || value.trim().length >= 5
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            "Please add a description (at least 5 characters)",
                          ),
                        ),
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                maxLength={DESCRIPTION_MAX}
                showCount
                placeholder="Why should this affiliate be assigned to you?"
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={pending}
            icon={<Send className="h-4 w-4" aria-hidden="true" />}
            className="w-full sm:w-auto"
          >
            Send request
          </Button>
        </div>
      </Form>
    </div>
  );
}
