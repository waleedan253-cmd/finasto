// Homepage copy, kept out of JSX so it can move to Supabase-driven
// content later without touching hero-section.tsx / trust-strip.tsx.

export const heroContent = {
  eyebrow: "Pure Botanical Wellness",
  headline: ["Nature's Calm", "in Every Sip"],
  subheading:
    "Discover Finasto's premium botanical tea collection, thoughtfully presented for modern everyday rituals.",
  primaryCta: { label: "Explore Collection", href: "/shop" },
  secondaryCta: { label: "Our Story", href: "/our-story" },
};

export type TrustItem = {
  id: string;
  title: string;
  description: string;
};

export const trustItems: TrustItem[] = [
  {
    id: "natural",
    title: "100% Natural Ingredients",
    description: "Pure, safe, effective.",
  },
  {
    id: "origin",
    title: "Authentic Bali Origin",
    description: "From the rich volcanic soil.",
  },
  {
    id: "payment",
    title: "Secure Payment",
    description: "Multiple payment options.",
  },
  {
    id: "delivery",
    title: "Regional Delivery",
    description: "Indonesia & beyond.",
  },
];
