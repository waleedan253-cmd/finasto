// All copy and settings for the contact page live here.

export const contactTopics = [
  { id: "general", label: "General enquiry" },
  { id: "order", label: "Order support" },
  { id: "product", label: "Product question" },
  { id: "partnership", label: "Partnership" },
] as const;

export type ContactTopicId = (typeof contactTopics)[number]["id"];

export const contactContent = {
  hero: {
    eyebrow: "Contact",
    title: "We’d love to hear from you",
    text: "Questions about an order, our collection or working together? Send us a message and we’ll get back to you.",
  },

  // Shown only when set. Add NEXT_PUBLIC_CONTACT_EMAIL to your env file.
  details: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  },

  responseNote: "We’ll get back to you as soon as we can.",

  // Update to your real privacy policy URL.
  privacyHref: "/privacy-policy",
  trackOrderHref: "/track-order",

  faq: [
    {
      q: "Where can I find my tracking code?",
      a: "Your tracking code is in your order confirmation email.",
    },
    {
      q: "How do I check my order status?",
      a: "Enter your email and tracking code on the Track Order page to follow your order from processing and dispatch to delivery.",
    },
    {
      q: "Do you deliver worldwide?",
      a: "Yes. Finasto delivers from Indonesia to doorsteps across the world.",
    },
  ],
} as const;