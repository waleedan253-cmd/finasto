"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import {
  submitSupportRequest,
  type SupportState,
} from "@/lib/affiliate/support-actions";

const initial: SupportState = { ok: false };

const fieldClass =
  "w-full rounded-xl border border-aff-border bg-white px-3.5 py-2.5 font-sans text-[14px] text-aff-green-900 outline-none transition-colors placeholder:text-aff-muted/60 focus:border-aff-gold-500 focus:ring-2 focus:ring-aff-gold-400/30 disabled:bg-aff-ivory disabled:text-aff-muted";

export function SupportEmailForm({ replyTo }: { replyTo: string }) {
  const [state, formAction, isPending] = useActionState(
    submitSupportRequest,
    initial,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.ok && (
        <div
          role="status"
          className="rounded-xl border border-[rgba(47,158,107,0.3)] bg-[rgba(47,158,107,0.1)] px-4 py-3 font-sans text-[13px] text-[#1F7A52]"
        >
          Message sent. We will reply to {replyTo}.
        </div>
      )}

      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-[rgba(190,60,50,0.3)] bg-[rgba(190,60,50,0.06)] px-4 py-3 font-sans text-[13px] font-medium text-[#A3342B]"
        >
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="support-email"
          className="mb-1.5 block font-sans text-[13px] font-medium text-aff-green-900"
        >
          Reply to
        </label>
        <input
          id="support-email"
          type="email"
          value={replyTo}
          readOnly
          disabled
          className={fieldClass}
        />
      </div>

      <div>
        <label
          htmlFor="support-subject"
          className="mb-1.5 block font-sans text-[13px] font-medium text-aff-green-900"
        >
          Subject
        </label>
        <input
          id="support-subject"
          name="subject"
          maxLength={120}
          defaultValue={state.values?.subject}
          placeholder="e.g. Payout request question"
          className={fieldClass}
          disabled={isPending}
        />
        {state.fieldErrors?.subject && (
          <p className="mt-1 font-sans text-[12px] text-[#A3342B]">
            {state.fieldErrors.subject}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="support-message"
          className="mb-1.5 block font-sans text-[13px] font-medium text-aff-green-900"
        >
          Message
        </label>
        <textarea
          id="support-message"
          name="message"
          rows={5}
          maxLength={2000}
          defaultValue={state.values?.message}
          placeholder="Describe what you need help with"
          className={fieldClass}
          disabled={isPending}
        />
        {state.fieldErrors?.message && (
          <p className="mt-1 font-sans text-[12px] text-[#A3342B]">
            {state.fieldErrors.message}
          </p>
        )}
      </div>

      {/* Honeypot: real users never see or fill this. Bots do. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-aff-gold-600/40 bg-aff-green-900 px-6 font-sans text-[14px] font-medium text-aff-gold-300 transition-colors hover:bg-aff-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {isPending ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}