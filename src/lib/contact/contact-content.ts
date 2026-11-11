// All copy and settings for the contact page live here.

export const contactTopics = [
  { id: "general", label: "General Enquiry" },
  { id: "order", label: "Order Support" },
  { id: "product", label: "Product Enquiry" },
  { id: "partnership", label: "Returns & Refunds" },
  { id: "partnership", label: "Stockist Enquiry" },

] as const;

export type ContactTopicId = (typeof contactTopics)[number]["id"];

export const contactContent = {
  hero: {
    eyebrow: "Contact",
    title: "We’d love to hear from you",
    text: "For product enquiries, order assistance, exclusive offers, and FINASTO™ Stockist enquiries, our dedicated team is always here to assist you.",
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
      q: "Do your products contain allergens?",
      a: "All ingredients are listed on our product pages and packaging. Please review them before purchasing if you have any allergies or dietary concerns.",
    },
    {
      q: "Do I need an account to place an order?",
      a: "No. You can enjoy a seamless shopping experience by placing your order as a guest, without creating an account.",
    },
    {
      q: "Which currency are prices displayed in?",
      a: "Prices are displayed in the currency applicable to your selected market. Where local currency display is unavailable, prices will be shown in US Dollars (USD).",
    },
    {
      q: "Which payment methods do you accept?",
      a: "We offer a range of secure payment methods, depending on your location. All available payment options will be displayed at checkout.",
    },
    {
      q: "Do you offer worldwide delivery?",
      a: "Yes. FINASTO™ ships from Indonesia to customers worldwide, subject to destination availability. Shipping options and applicable charges are displayed at checkout.",
    },
    {
      q: "How long does delivery take?",
      a: "Orders are typically processed within 1–3 business days. Delivery within Indonesia generally takes 2–5 business days, while international deliveries may take approximately 7–21 business days, depending on the destination.",
    },
    {
      q: "Where can I find my tracking number?",
      a: "Once you place your order, all tracking information will be sent directly to your registered email address.",
    },
    {
      q: "How can I track my order?",
      a: "You can conveniently track your order using your tracking number through the",
link: { label: "Track Order page", href: "/track-order" },
    },
    {
      q: "Will I have to pay customs duties or import taxes?",
      a: "International orders may be subject to customs duties, import taxes or other charges imposed by the destination country. Unless otherwise stated at checkout, these charges are the responsibility of the customer.",
    },
    {
      q: "Can I return or exchange an item?",
      a: "Returns and exchanges are subject to our Returns & Refunds Policy.",
    link: { label: "Returns & Refunds", href: "/returns" },
    },
    {
      q: "How can I become a FINASTO™ Stockist?",
      a: "FINASTO™ welcomes independent stockist applications from international markets outside Indonesia. Contact our team to learn about stockist eligibility, exclusive pricing and distribution requirements.",
    },
    {
      q: "Can I resell FINASTO™ products in my market?",
      a: "Yes. Approved stockists can resell FINASTO™ products within their authorised international markets, subject to our stockist terms and conditions.",
    },
  ],
} as const;