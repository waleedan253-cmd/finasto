"use server";

import { headers } from "next/headers";
import { contactSchema } from "./contact-schema";
import { sendContactEmail } from "./send-contact-email";

type ContactResult = { success: true } | { success: false; error: string };

// Simple per-IP limit: 5 messages / 10 minutes. This memory is per server
// instance; for strict limits across many instances use Redis/Upstash instead.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function tooManyRequests(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function submitContactAction(
  input: unknown,
): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Please check the form and try again.",
    };
  }

  const { website, startedAt, ...data } = parsed.data;

  // Bots: filled the hidden field, or submitted faster than a person can.
  // Pretend it worked so they learn nothing.
  if (website) return { success: true };
  if (typeof startedAt === "number" && Date.now() - startedAt < 1500) {
    return { success: true };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooManyRequests(ip)) {
    return {
      success: false,
      error: "Too many messages in a short time. Please try again later.",
    };
  }

  try {
    await sendContactEmail({
      name: data.name,
      email: data.email,
      topic: data.topic,
      message: data.message,
    });
    return { success: true };
  } catch (err) {
    console.error("[contact] failed to send", err);
    return {
      success: false,
      error: "We couldn’t send your message right now. Please try again shortly.",
    };
  }
}