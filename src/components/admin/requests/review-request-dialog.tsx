"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Descriptions, Input, Modal, message } from "antd";

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
            ? `${r.affiliateName} assigned to ${r.requestedBy.name}`
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
                <div className="font-medium">{r.affiliateName}</div>
                <div className="text-[12px] text-neutral-500">
                  {r.affiliateEmail}
                </div>
              </div>
            ),
          },
          {
            key: "requestedBy",
            label: "Requested by",
            children: <span className="font-medium">{r.requestedBy.name}</span>,
          },
          {
            key: "currentStockist",
            label: "Currently with",
            children: r.matched ? (
              <span>{r.matched.currentStockist?.name ?? "Unassigned"}</span>
            ) : (
              <span className="text-[#cf1322]">
                No affiliate with this email yet
              </span>
            ),
          },
          {
            key: "description",
            label: "Description",
            children: (
              <span className="whitespace-pre-wrap">{r.description}</span>
            ),
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
              r.matched ? (
                <>
                  <strong>{r.matched.name}</strong> will be assigned to{" "}
                  <strong>{r.requestedBy.name}</strong> right away
                  {r.matched.currentStockist ? (
                    <>
                      {" "}
                      (currently with{" "}
                      <strong>{r.matched.currentStockist.name}</strong>)
                    </>
                  ) : null}
                  . Orders already placed keep their original stockist; new
                  orders use <strong>{r.requestedBy.name}</strong>.
                </>
              ) : (
                <>
                  No affiliate had the email <strong>{r.affiliateEmail}</strong>{" "}
                  when this was sent. Approval works only if they have signed up
                  since. If not, you will see a message and can reject the
                  request instead.
                </>
              )
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
