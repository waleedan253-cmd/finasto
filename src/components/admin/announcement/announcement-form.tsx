"use client";

// Create / edit announcement in an Ant Design Modal. One component for both
// modes: pass `editing` to edit, or null to create. The modal is destroyed on
// close, so every open starts from fresh initialValues (no stale fields).

import { useTransition } from "react";
import { Modal, Form, Input, DatePicker, Switch, Button, message } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import {
  createAnnouncement,
  updateAnnouncement,
  type AnnouncementInput,
} from "@/lib/admin/announcement-actions";
import type { AnnouncementItem } from "@/lib/admin/announcement-queries";

type FormValues = {
  message: string;
  link?: string;
  isActive: boolean;
  startsAt?: Dayjs | null;
  endsAt?: Dayjs | null;
};

type Props = {
  open: boolean;
  editing: AnnouncementItem | null;
  onClose: () => void;
};

const DATE_FORMAT = "DD MMM YYYY, HH:mm";

export function AnnouncementForm({ open, editing, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [msg, msgContext] = message.useMessage();
  const [pending, startTransition] = useTransition();

  const initialValues: FormValues = editing
    ? {
        message: editing.message,
        link: editing.link ?? "",
        isActive: editing.isActive,
        startsAt: editing.startsAt ? dayjs(editing.startsAt) : null,
        endsAt: editing.endsAt ? dayjs(editing.endsAt) : null,
      }
    : { message: "", link: "", isActive: true, startsAt: null, endsAt: null };

  function handleFinish(values: FormValues) {
    const link = values.link?.trim();
    const payload: AnnouncementInput = {
      message: values.message,
      link: link ? link : null,
      isActive: values.isActive,
      // toISOString() = UTC, so the stored time is correct for every visitor
      // worldwide, whatever timezone the admin picked it in.
      startsAt: values.startsAt ? values.startsAt.toISOString() : null,
      endsAt: values.endsAt ? values.endsAt.toISOString() : null,
    };

    startTransition(async () => {
      const res = editing
        ? await updateAnnouncement(editing.id, payload)
        : await createAnnouncement(payload);

      if (!res.success) {
        // Show server-side zod errors under the matching fields.
        if (res.fieldErrors) {
          form.setFields(
            Object.entries(res.fieldErrors).map(([name, errors]) => ({
              name: name as keyof FormValues,
              errors,
            })),
          );
        }
        msg.error(res.error);
        return;
      }

      msg.success(editing ? "Announcement updated" : "Announcement created");
      onClose();
    });
  }

  return (
    <>
      {msgContext}
      <Modal
        open={open}
        title={editing ? "Edit announcement" : "New announcement"}
        onCancel={onClose}
        footer={null}
        destroyOnHidden
        maskClosable={!pending}
        width="min(560px, calc(100vw - 32px))"
        style={{ top: 16 }}
      >
        <Form<FormValues>
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleFinish}
          disabled={pending}
          requiredMark={false}
        >
          <Form.Item
            name="message"
            label="Message"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Message is required",
              },
              { max: 200, message: "Maximum 200 characters" },
            ]}
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 4 }}
              maxLength={200}
              showCount
              placeholder="Free shipping on orders over $50"
              style={{
                borderRadius: "8px",
              }}
            />
          </Form.Item>

          <Form.Item
            name="link"
            label="Link (optional)"
            rules={[
              {
                validator: (_, value?: string) => {
                  const v = value?.trim();
                  if (!v) return Promise.resolve();
                  if (v.startsWith("//")) return Promise.reject("Invalid link");
                  if (v.startsWith("/") || v.startsWith("https://")) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    "Use a path like /shop or a full https:// link",
                  );
                },
              },
            ]}
          >
            <Input placeholder="/shop" />
          </Form.Item>

          {/* Single column on every screen size: simplest and works on phones. */}
          <Form.Item name="startsAt" label="Starts (optional)">
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format={DATE_FORMAT}
              needConfirm={false}
              style={{ width: "100%" }}
              placeholder="Show immediately"
            />
          </Form.Item>

          <Form.Item
            name="endsAt"
            label="Ends (optional)"
            dependencies={["startsAt"]}
            rules={[
              ({ getFieldValue }) => ({
                validator: (_, value?: Dayjs | null) => {
                  const start = getFieldValue("startsAt") as
                    | Dayjs
                    | null
                    | undefined;
                  if (!value || !start || value.isAfter(start)) {
                    return Promise.resolve();
                  }
                  return Promise.reject("End must be after start");
                },
              }),
            ]}
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format={DATE_FORMAT}
              needConfirm={false}
              style={{ width: "100%" }}
              placeholder="Never expires"
            />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={pending}>
              {editing ? "Save changes" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
