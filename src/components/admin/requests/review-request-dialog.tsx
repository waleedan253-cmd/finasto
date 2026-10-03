"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Descriptions, Input, Modal, message } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { approveRequest, rejectRequest } from "@/lib/admin/request-actions";
import type { RequestListItem } from "@/lib/admin/request-queries";
import { RequestStatusBadge } from "./request-status-badge";

// Modal used on the Requests page.
//
//   Pending request  -> summary, then three buttons:
//       Approve  -> confirmation step (optional note)  -> reassigns
//       Reject   -> note step (note REQUIRED)          -> records decision
//   Decided request  -> read-only summary with the decision note.
//
// Nothing happens until the admin confirms in the second step, so a stray
// click on "Approve" can never move an affiliate by itself.

type Step = "review" | "approve" | "reject";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function ReviewRequestDialog({
  request,
  onClose,
}: {
  request: RequestListItem | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Keep showing the last request while the modal fades out, so the content
  // does not vanish before the closing animation ends.
  const [shown, setShown] = useState<RequestListItem | null>(request);
  const [step, setStep] = useState<Step>("review");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);

  // A newly opened request always starts from a clean "review" step.
  useEffect(() => {
    if (!request) return;
    setShown(request);
    setStep("review");
    setNote("");
    setError(null);
    setNoteError(null);
  }, [request]);

  if (!shown) return null;
  const r = shown;
  const isDecided = r.status !== "pending";

  function goTo(next: Step) {
    setStep(next);
    setNote("");
    setError(null);
    setNoteError(null);
  }

  function submit(kind: "approve" | "reject") {
    setError(null);
    setNoteError(null);

    if (kind === "reject" && note.trim() === "") {
      setNoteError("Add a short note explaining the rejection");
      return;
    }

    startTransition(async () => {
      const result =
        kind === "approve"
          ? await approveRequest(r.id, note)
          : await rejectRequest(r.id, note);

      if (result.success) {
        message.success(
          kind === "approve"
            ? `${r.affiliate.name} moved to ${r.toStockist.name}`
            : "Request rejected",
        );
        router.refresh();
        onClose();
        return;
      }

      setError(result.error);
      const fieldMessage = result.fieldErrors?.note?.[0];
      if (fieldMessage) setNoteError(fieldMessage);
    });
  }

  function close() {
    if (!isPending) onClose();
  }

  const title =
    step === "approve"
      ? "Approve request"
      : step === "reject"
        ? "Reject request"
        : isDecided
          ? "Request details"
          : "Review request";

  const footer = isDecided ? (
    <Button onClick={close}>Close</Button>
  ) : step === "review" ? (
    <div className="flex justify-end gap-2">
      <Button onClick={close}>Cancel</Button>
      <Button danger onClick={() => goTo("reject")}>
        Reject
      </Button>
      <Button type="primary" onClick={() => goTo("approve")}>
        Approve
      </Button>
    </div>
  ) : step === "approve" ? (
    <div className="flex justify-end gap-2">
      <Button onClick={() => goTo("review")} disabled={isPending}>
        Back
      </Button>
      <Button
        type="primary"
        loading={isPending}
        onClick={() => submit("approve")}
      >
        Confirm approval
      </Button>
    </div>
  ) : (
    <div className="flex justify-end gap-2">
      <Button onClick={() => goTo("review")} disabled={isPending}>
        Back
      </Button>
      <Button
        danger
        type="primary"
        loading={isPending}
        onClick={() => submit("reject")}
      >
        Confirm rejection
      </Button>
    </div>
  );

  return (
    <Modal
      open={request !== null}
      title={title}
      width={560}
      footer={footer}
      onCancel={close}
      maskClosable={!isPending}
      keyboard={!isPending}
      closable={!isPending}
    >
      <Descriptions
        bordered
        size="small"
        column={1}
        className="mb-4"
        labelStyle={{ width: 130 }}
        items={[
          {
            key: "affiliate",
            label: "Affiliate",
            children: (
              <div>
                <div className="font-medium">{r.affiliate.name}</div>
                {r.affiliate.email && (
                  <div className="text-[12px] text-neutral-500">
                    {r.affiliate.email}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "move",
            label: "Move",
            children: (
              <span className="inline-flex flex-wrap items-center gap-2">
                <span>{r.fromStockist.name}</span>
                <ArrowRightOutlined className="text-neutral-400" />
                <span className="font-medium">{r.toStockist.name}</span>
              </span>
            ),
          },
          {
            key: "reason",
            label: "Reason",
            children: <span className="whitespace-pre-wrap">{r.reason}</span>,
          },
          {
            key: "submitted",
            label: "Submitted",
            children: dateFmt.format(new Date(r.createdAt)),
          },
          ...(isDecided
            ? [
                {
                  key: "status",
                  label: "Decision",
                  children: <RequestStatusBadge status={r.status} />,
                },
                {
                  key: "reviewed",
                  label: "Decided on",
                  children: r.reviewedAt
                    ? dateFmt.format(new Date(r.reviewedAt))
                    : "—",
                },
                {
                  key: "note",
                  label: "Admin note",
                  children: r.adminNote ? (
                    <span className="whitespace-pre-wrap">{r.adminNote}</span>
                  ) : (
                    <span className="text-neutral-400">No note</span>
                  ),
                },
              ]
            : []),
        ]}
      />

      {error && (
        <Alert
          type="error"
          showIcon
          closable
          message={error}
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      {step === "approve" && (
        <div>
          <Alert
            type="warning"
            showIcon
            className="mb-3"
            message={
              <>
                <strong>{r.affiliate.name}</strong> will move from{" "}
                <strong>{r.fromStockist.name}</strong> to{" "}
                <strong>{r.toStockist.name}</strong> right away. Orders already
                placed keep <strong>{r.fromStockist.name}</strong>; new orders
                use <strong>{r.toStockist.name}</strong>.
              </>
            }
          />
          <label className="mb-1 block text-[13px] text-neutral-500">
            Note (optional)
          </label>
          <Input.TextArea
            rows={3}
            showCount
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
            status={noteError ? "error" : undefined}
            placeholder="Visible to the stockist with the decision"
          />
          {noteError && (
            <p className="mt-1 text-[12px] text-[#ff4d4f]">{noteError}</p>
          )}
        </div>
      )}

      {step === "reject" && (
        <div>
          <label className="mb-1 block text-[13px] text-neutral-500">
            Why is this rejected? <span className="text-[#ff4d4f]">*</span>
          </label>
          <Input.TextArea
            rows={2}
            showCount
            // maxLength={400}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
            status={noteError ? "error" : undefined}
            placeholder="The stockist will see this note"
            autoFocus
            style={{
              borderRadius: "8px",
            }}
          />
          {noteError && (
            <p className="mt-1 text-[12px] text-[#ff4d4f]">{noteError}</p>
          )}
        </div>
      )}
    </Modal>
  );
}
