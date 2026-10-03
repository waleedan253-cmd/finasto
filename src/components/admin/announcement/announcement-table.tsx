"use client";

// Admin list of announcements: Ant Design Table with a live/scheduled/expired
// status, a quick on/off switch, edit and delete. The server page passes in
// `items`; after any action the server calls revalidatePath, so Next
// re-renders the page and new props arrive here automatically.

import { useEffect, useState, useTransition } from "react";
import {
  Button,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
  type TableProps,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  deleteAnnouncement,
  setAnnouncementActive,
} from "@/lib/admin/announcement-actions";
import type { AnnouncementItem } from "@/lib/admin/announcement-queries";
import { AnnouncementForm } from "./announcement-form";

const DATE_FORMAT = "DD MMM YYYY, HH:mm";

function getStatus(item: AnnouncementItem, now: number) {
  if (!item.isActive) return { label: "Off", color: "default" };
  if (item.endsAt && Date.parse(item.endsAt) <= now)
    return { label: "Expired", color: "red" };
  if (item.startsAt && Date.parse(item.startsAt) > now)
    return { label: "Scheduled", color: "blue" };
  return { label: "Live", color: "green" };
}

export function AnnouncementTable({ items }: { items: AnnouncementItem[] }) {
  const [msg, msgContext] = message.useMessage();
  const [modal, modalContext] = Modal.useModal();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AnnouncementItem | null>(null);

  // Status and dates depend on the current time and the viewer's timezone.
  // The server has neither, so we render them only after mount. This avoids
  // a hydration mismatch.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), [items]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: AnnouncementItem) {
    setEditing(item);
    setFormOpen(true);
  }

  function handleToggle(item: AnnouncementItem, checked: boolean) {
    setBusyId(item.id);
    startTransition(async () => {
      const res = await setAnnouncementActive(item.id, checked);
      if (!res.success) msg.error(res.error);
      setBusyId(null);
    });
  }

  function handleDelete(item: AnnouncementItem) {
    setBusyId(item.id);
    startTransition(async () => {
      const res = await deleteAnnouncement(item.id);
      if (res.success) msg.success("Announcement deleted");
      else msg.error(res.error);
      setBusyId(null);
    });
  }

  function confirmDelete(item: AnnouncementItem) {
    modal.confirm({
      title: "Delete this announcement?",
      content: "This cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        setBusyId(item.id);
        const res = await deleteAnnouncement(item.id);
        if (res.success) msg.success("Announcement deleted");
        else msg.error(res.error);
        setBusyId(null);
      },
    });
  }

  const columns: TableProps<AnnouncementItem>["columns"] = [
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      width: 280,
      render: (text: string, item) => (
        <div>
          <Typography.Text>{text}</Typography.Text>
          {item.link && (
            <div>
              <Typography.Text type="secondary" className="text-xs">
                {item.link}
              </Typography.Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 110,
      render: (_, item) => {
        if (now === null) return null;
        const s = getStatus(item, now);
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: "Schedule",
      key: "schedule",
      width: 220,
      render: (_, item) => {
        if (now === null) return null;
        if (!item.startsAt && !item.endsAt) return "Always on";
        return (
          <div className="text-xs leading-5">
            <div>
              From:{" "}
              {item.startsAt ? dayjs(item.startsAt).format(DATE_FORMAT) : "Now"}
            </div>
            <div>
              Until:{" "}
              {item.endsAt ? dayjs(item.endsAt).format(DATE_FORMAT) : "No end"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Active",
      key: "active",
      width: 80,
      render: (_, item) => (
        <Switch
          checked={item.isActive}
          loading={pending && busyId === item.id}
          onChange={(checked) => handleToggle(item, checked)}
          aria-label={`Toggle announcement: ${item.message}`}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, item) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(item)}
            aria-label="Edit announcement"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            // loading={pending && busyId === item.id}
            aria-label="Delete announcement"
            onClick={() => confirmDelete(item)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      {msgContext}
      {modalContext}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Announcements</h1>
          <p className="text-sm opacity-70">
            Messages shown in the bar at the top of the storefront.
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          New announcement
        </Button>
      </div>

      <Table<AnnouncementItem>
        rowKey="id"
        columns={columns}
        dataSource={items}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        // On phones the table scrolls sideways inside its own box
        // instead of squeezing the columns or breaking the page layout.
        scroll={{ x: 720 }}
        locale={{ emptyText: "No announcements yet" }}
      />

      <AnnouncementForm
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
      />
    </>
  );
}
