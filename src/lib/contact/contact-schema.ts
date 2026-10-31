import { z } from "zod";
import { contactTopics, type ContactTopicId } from "./contact-content";

const topicIds = contactTopics.map((t) => t.id) as [
  ContactTopicId,
  ...ContactTopicId[],
];

// Shared by the form (client) and the server action, so rules never drift apart.
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(80, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .max(120, "Email is too long"),
  topic: z.enum(topicIds),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(2000, "Message is too long (2000 characters max)"),
  consent: z
    .boolean()
    .refine((v) => v === true, "Please agree so we can reply to you"),
  // spam traps (not shown to people)
  website: z.string().optional(),
  startedAt: z.number().optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;