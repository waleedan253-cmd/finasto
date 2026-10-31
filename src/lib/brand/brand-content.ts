// All copy for the brand page lives here, so wording can change without touching the UI.

export const BRAND_NAME = "FINASTO™";

export const brandNav = [
  { id: "brand", label: BRAND_NAME },
  { id: "story", label: "Our Story" },
  { id: "vision-mission", label: "Vision & Mission" },
  { id: "quality", label: "Quality" },
] as const;

export const brandContent = {
  hero: {
    eyebrow: "Indonesian Tea & Coffee",
    tagline: "Nature’s botanical diversity, in every cup.",
  },

  intro: {
    eyebrow: BRAND_NAME,
    title: "Signature of Nature, Rooted in Indonesia",
    pullQuote: "Nature remains at the heart of FINASTO™.",
    paragraphs: [
      "FINASTO™ is a premium Indonesian tea and coffee brand built on an appreciation for nature, a commitment to quality, and a vision to create a distinctive collection for a global audience. Our approach is guided by thoughtful product selection, considered development, and attention to the details that shape our brand identity.",
      "Nature’s extraordinary botanical diversity offers a world of inspiration, from delicate flowers and distinctive herbs to the remarkable variety of plants found across the natural world. At FINASTO™, this richness informs our perspective and inspires our vision of bringing the botanical world closer to people through tea and coffee.",
      "Our approach is guided by curiosity, care, and respect for the natural world. We explore the possibilities of botanical ingredients and consider how they can be thoughtfully brought together in products that reflect our quality standards. Working with trusted production partners, we focus on careful selection, consistency, and the principles that define the FINASTO™ name.",
      "Nature remains at the heart of FINASTO™, inspiring our appreciation for botanical diversity and guiding the way we select and develop our collection. As we grow, we hope to share this appreciation with people around the world, staying true to the values and vision that have shaped FINASTO™ from the beginning.",
    ],
  },

  story: {
    eyebrow: "Our Story",
    title: "A Vision Nurtured for More Than a Decade",
    stat: { value: "10+", label: "Years of vision" },
    paragraphs: [
      "For more than a decade, we have carried a vision of bringing nature’s remarkable botanical diversity closer to people through thoughtfully developed tea and coffee, creating a meaningful connection with nature in every cup.",
      "Our inspiration comes from the extraordinary world of flowers, herbs, and botanicals, and the richness of their natural diversity. We envisioned a way to bring these elements together through carefully selected ingredients and thoughtfully developed products, guided by a genuine appreciation for nature and a lasting commitment to quality.",
      "That long-held vision has now taken shape in FINASTO™. As our brand begins a new chapter, it carries years of thought, dedication, and a desire to create something meaningful. Working with trusted production partners, we are building a distinctive collection that reflects our values and the standards we believe in.",
      "Every cup of FINASTO™ represents more than tea or coffee. It brings together nature’s remarkable botanical diversity and a vision shaped by years of thought, dedication, and careful consideration. Through every cup, we hope to bring people closer to the natural world and share the idea that has been at the heart of FINASTO™ for so many years.",
    ],
    closing: "FINASTO™: A Vision Years in Making.",
  },

  vision: {
    eyebrow: "Our Vision",
    text: "To establish FINASTO™ as a globally recognised Indonesian tea and coffee brand, proudly bringing the spirit of Indonesia to the world. We aspire to build a lasting global presence through a strong brand identity, exceptional standards of quality, and a clear sense of purpose, creating a name that represents excellence and enduring value for generations to come.",
  },

  mission: {
    eyebrow: "Our Mission",
    text: "Bringing together carefully selected tea and coffee collections inspired by the richness of herbs and botanicals, FINASTO™ is committed to thoughtful selection, attention to detail, and consistent quality. Through these principles, we strive to offer a refined brand experience, uphold the values that define our identity, and build lasting trust with customers around the world.",
  },

  quality: {
    eyebrow: "Our Commitment to Quality",
    title: "Quality is at the heart of everything we stand for.",
    text: "At FINASTO™, quality is at the heart of everything we stand for. From the careful selection of herbs and botanicals to the finest details of our brand, we are guided by a commitment to consistency, care, and excellence. Every decision reflects our dedication to maintaining high standards and preserving the principles that define FINASTO™. Through this enduring commitment, we aim to build a brand recognised for its integrity, refinement, and lasting quality.",
    principles: [
      {
        title: "Careful selection",
        text: "From herbs and botanicals to the finest details of our brand.",
      },
      {
        title: "Consistency",
        text: "High standards, maintained in every decision.",
      },
      {
        title: "Care",
        text: "Attention to detail in all that we develop.",
      },
      {
        title: "Integrity",
        text: "A brand recognised for refinement and lasting quality.",
      },
    ],
  },

  cta: {
    label: "Explore the collection",
    href: "/shop",
  },
} as const;