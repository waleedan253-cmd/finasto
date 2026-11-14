// "use client";

// import { useActionState } from "react";
// import { Send } from "lucide-react";
// import {
//   submitSupportRequest,
//   type SupportState,
// } from "@/lib/affiliate/support-actions";

// const initial: SupportState = { ok: false };

// const fieldClass =
//   "w-full rounded-xl border border-aff-border bg-white px-3.5 py-2.5 font-sans text-[14px] text-aff-green-900 outline-none transition-colors placeholder:text-aff-muted/60 focus:border-aff-gold-500 focus:ring-2 focus:ring-aff-gold-400/30 disabled:bg-aff-ivory disabled:text-aff-muted";

// export function SupportEmailForm({ replyTo }: { replyTo: string }) {
//   const [state, formAction, isPending] = useActionState(
//     submitSupportRequest,
//     initial,
//   );

//   return (
//     <form action={formAction} className="flex flex-col gap-4" noValidate>
//       {state.ok && (
//         <div
//           role="status"
//           className="rounded-xl border border-[rgba(47,158,107,0.3)] bg-[rgba(47,158,107,0.1)] px-4 py-3 font-sans text-[13px] text-[#1F7A52]"
//         >
//           Message sent. We will reply to {replyTo}.
//         </div>
//       )}

//       {state.error && (
//         <div
//           role="alert"
//           className="rounded-xl border border-[rgba(190,60,50,0.3)] bg-[rgba(190,60,50,0.06)] px-4 py-3 font-sans text-[13px] font-medium text-[#A3342B]"
//         >
//           {state.error}
//         </div>
//       )}

      

//       <div>
//         <label
//           htmlFor="support-subject"
//           className="mb-1.5 block font-sans text-[13px] font-medium text-aff-green-900"
//         >
//           Subject
//         </label>
//         <input
//           id="support-subject"
//           name="subject"
//           maxLength={120}
//           defaultValue={state.values?.subject}
//           placeholder="e.g. Payout request question"
//           className={fieldClass}
//           disabled={isPending}
//         />
//         {state.fieldErrors?.subject && (
//           <p className="mt-1 font-sans text-[12px] text-[#A3342B]">
//             {state.fieldErrors.subject}
//           </p>
//         )}
//       </div>

//       <div>
//         <label
//           htmlFor="support-message"
//           className="mb-1.5 block font-sans text-[13px] font-medium text-aff-green-900"
//         >
//           Message
//         </label>
//         <textarea
//           id="support-message"
//           name="message"
//           rows={5}
//           maxLength={2000}
//           defaultValue={state.values?.message}
//           placeholder="Describe what you need help with"
//           className={fieldClass}
//           disabled={isPending}
//         />
//         {state.fieldErrors?.message && (
//           <p className="mt-1 font-sans text-[12px] text-[#A3342B]">
//             {state.fieldErrors.message}
//           </p>
//         )}
//       </div>

//       {/* Honeypot: real users never see or fill this. Bots do. */}
//       <input
//         type="text"
//         name="website"
//         tabIndex={-1}
//         autoComplete="off"
//         aria-hidden="true"
//         className="hidden"
//       />

//       <div className="flex justify-end">
//         <button
//           type="submit"
//           disabled={isPending}
//           className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-aff-gold-600/40 bg-aff-green-900 px-6 font-sans text-[14px] font-medium text-aff-gold-300 transition-colors hover:bg-aff-green-800 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           <Send className="h-4 w-4" aria-hidden="true" />
//           {isPending ? "Sending..." : "Send message"}
//         </button>
//       </div>
//     </form>
//   );
// }
"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import {
  submitSupportRequest,
  type SupportState,
} from "@/lib/affiliate/support-actions";

const initial: SupportState = { ok: false };

const fieldClass =
  "w-full rounded-xl border border-aff-border bg-aff-ivory/60 px-3.5 py-3 font-sans text-[16px] text-aff-green-900 shadow-[inset_0_1px_2px_rgba(3,24,7,0.04)] outline-none transition-all duration-200 placeholder:text-aff-muted/60 hover:border-aff-gold-500 focus:border-aff-gold-600 focus:bg-white focus:ring-4 focus:ring-aff-gold-400/20 disabled:cursor-not-allowed disabled:bg-aff-ivory disabled:text-aff-muted sm:text-[14px]";

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
          className="flex items-start gap-2.5 rounded-xl border border-[rgba(47,158,107,0.3)] bg-[rgba(47,158,107,0.1)] px-4 py-3 font-sans text-[13px] text-[#1F7A52]"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">
            Message sent. We will reply to {replyTo}.
          </span>
        </div>
      )}

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-[rgba(190,60,50,0.3)] bg-[rgba(190,60,50,0.06)] px-4 py-3 font-sans text-[13px] font-medium text-[#A3342B]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{state.error}</span>
        </div>
      )}

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
          rows={6}
          maxLength={2000}
          defaultValue={state.values?.message}
          placeholder="Describe what you need help with"
          className={`${fieldClass} min-h-[140px] resize-y`}
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

      <div className="flex flex-col gap-3 border-t border-aff-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 break-words font-sans text-[12px] text-aff-muted">
          Replies go to{" "}
          <span className="font-medium text-aff-green-900">{replyTo}</span>
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 px-6 font-sans text-[14px] font-semibold text-aff-green-950 shadow-[0_10px_26px_-14px_rgba(172,131,78,0.8)] transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none sm:w-auto sm:min-w-[170px] [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:brightness-105"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
          {isPending ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}