import { contactTopics, type ContactTopicId } from "./contact-content";

type ContactMessage = {
  name: string;
  email: string;
  topic: ContactTopicId;
  message: string;
};

// Sends the message to your inbox using Resend's REST API (no extra package).
// Required env vars: RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL
// (CONTACT_FROM_EMAIL must be an address on a domain you verified in Resend).
// To use another provider (SendGrid, Postmark, SMTP), replace the body of this function.
export async function sendContactEmail(msg: ContactMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] email not configured, message was:", msg);
      return;
    }
    throw new Error("Contact email is not configured");
  }

  const topicLabel =
    contactTopics.find((t) => t.id === msg.topic)?.label ?? msg.topic;
  const safeName = msg.name.replace(/[\r\n]+/g, " ");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: msg.email,
      subject: `[Finasto contact] ${topicLabel} from ${safeName}`,
      text: [
        `Name: ${safeName}`,
        `Email: ${msg.email}`,
        `Topic: ${topicLabel}`,
        "",
        msg.message,
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    throw new Error(`Email provider responded with ${res.status}`);
  }
}