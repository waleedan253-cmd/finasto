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

export const storyContent = {
  eyebrow: "Our Story",
  heading: ["Rooted in Bali.", "Made for Your Wellness."],
  paragraph:
    "Finasto is more than just a tea brand — it's a journey of nature, culture and care. Inspired by Bali's rich botanical heritage, we bring you pure, natural blends for a healthier, more balanced life.",
  cta: { label: "Learn More", href: "/our-story" },
};

export type WhySlide = {
  id: string;
  eyebrow: string;
  heading: string;
  description: string;
  image: string;
  details: string[];
  imageAlt: string;
};

// Each slide ties to something specific about Finasto's actual sourcing
export const whySlides: WhySlide[] = [
  {
    id: "origin",
    eyebrow: "Origin",
    heading: "Grown in Volcanic Soil",
    description:
      "Our botanicals come from Bali's terraced highlands, where mineral-rich volcanic soil, cool altitude air and tropical rainfall give every leaf its depth of character. We work with small-scale growers who tend each terrace by hand, season after season.",
    details: [
      "Sourced from Bali's terraced highlands",
      "Mineral-rich volcanic soil",
      "Harvested in small, seasonal lots",
    ],
    image: "/why/why-origins.png",
    imageAlt:
      "Bali volcano overlooking terraced rice fields with a mound of dark volcanic soil and frangipani flowers",
  },
  {
    id: "craft",
    eyebrow: "Craft",
    heading: "Hand-Selected Leaves",
    description:
      "Every batch is hand-sorted before blending, so only whole, intact leaves reach your cup. The result is a cleaner infusion, a fuller aroma and a taste that stays true from the first steep to the last.",
    details: [
      "Sorted by hand before every blend",
      "Whole leaf only, no dust or fannings",
      "Blended in small, controlled batches",
    ],
    image: "/why/why-craft.png",
    imageAlt:
      "Hands sorting loose tea leaves into a wooden bowl beside a cast-iron teapot and brewed tea",
  },
  {
    id: "purity",
    eyebrow: "Purity",
    heading: "Nothing Added, Nothing Hidden",
    description:
      "Our blends are 100% natural botanicals: clean ingredients you can recognize, steeped the way nature intended. Every pack lists exactly what is inside, with nothing to decode and nothing to hide.",
    details: [
      "100% natural botanicals",
      "No artificial flavors, colorants or fillers",
      "Full ingredient list on every pack",
    ],
    image: "/why/why-puritys.png",
    imageAlt:
      "A clear water droplet beside a mountain spring and fresh tea leaf, symbolizing natural purity",
  },
  {
    id: "trust",
    eyebrow: "Trust",
    heading: "A Ritual Worth Returning To",
    description:
      "From checkout to the first sip, Finasto is built around the small moments of calm people come back for. Ordering is simple, delivery is careful, and every cup is meant to slow your day down.",
    details: [
      "Fast guest checkout, no account required",
      "Packaged to preserve freshness in transit",
      "Designed for a daily moment of calm",
    ],
    image: "/why/why-trus.png",
    imageAlt:
      "A woman closing her eyes while breathing in the steam from a warm cup of tea",
  },
];

export type RitualStep = {
  id: string;
  title: string;
  description: string;
};

export const philosophyContent = {
  eyebrow: "Product Philosophy",
  heading: "The Finasto Ritual",
  intro:
    "Good tea isn't rushed. Here's how we'd suggest taking a few minutes with yours.",
  steps: [
    {
      id: "steep",
      title: "Steep",
      description:
        "Pour hot water over the leaves and let them unfurl for 3–5 minutes, releasing their full botanical character.",
    },
    {
      id: "pause",
      title: "Pause",
      description:
        "Set the cup down before the first sip. Let the steam settle — this is the moment the ritual asks you to slow down.",
    },
    {
      id: "savor",
      title: "Savor",
      description:
        "Taste each note as it changes, from the first warmth to the lingering botanical finish.",
    },
  ] as RitualStep[],
};
export const newsletterContent = {
  eyebrow: "Stay Connected",
  heading: "Join the Finasto Circle",
  subheading:
    "New blends, brewing notes, and early access to future collections — no spam, unsubscribe anytime.",
  placeholder: "Enter your email",
  buttonLabel: "Subscribe",
  successMessage: "You're on the list — welcome to the circle.",
};
