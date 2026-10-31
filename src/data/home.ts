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
    title: "Botanical Ingredients",
    description: "Carefully Selected Botanicals.",
  },
  {
    id: "origin",
    title: "Bali Essence",
    description: "Bali’s Finest Premium Tea.",
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
  heading: ["Indonesian Heritage.", "A Refined Taste of Nature."],
  paragraph:
    "Finasto™ is more than a beverage brand. It reflects a journey shaped by nature, culture, and a deep appreciation for quality. Rooted in Indonesian heritage, we bring together thoughtfully selected teas, coffees, and other beverages to make everyday moments more special.",
  cta: { label: "Learn More", href: "/brand" },
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
    heading: "Bali Heritage & Excellence",
    description:
      "Finasto™ brings together thoughtfully selected beverages, a commitment to quality, and an appreciation for nature’s finest inspirations. Our growing collection reflects diverse origins and a refined approach to everyday enjoyment.",
    details: [
      "Thoughtfully Selected Ingredients",
      "Diverse Product Origins",
      "Commitment to Quality",
    ],
    image: "/why/why.png",
    imageAlt:
      "Bali volcano overlooking terraced rice fields with a mound of dark volcanic soil and frangipani flowers",
  },
  {
    id: "craft",
    eyebrow: "Craft",
    heading: "Thoughtfully Curated Beverages",
    description:
      "At Finasto™, we believe that everyday moments deserve something special. Our collection brings together carefully selected teas, coffees, and other beverages, chosen with care and a focus on quality, simplicity, and timeless elegance.",
    details: [
      "A Distinctive Collection",
      "Carefully Selected Ingredients",
      "Elegance in Everyday Moments",
    ],
    image: "/why/Artisanal Tea Leaf Sorting.png",
    imageAlt:
      "Hands sorting loose tea leaves into a wooden bowl beside a cast-iron teapot and brewed tea",
  },
  {
    id: "purity",
    eyebrow: "TRANSPARENCY",
    heading: "Honesty in Every Detail",
    description:
      "Transparency and simplicity are at the heart of our approach. We provide clear and accurate information about our ingredients and products, with care and attention to detail, helping you make informed choices with confidence.",
    details: [
      "Ingredient Transparency",
      "Clear Product Information",
      "Detailed Product Labels",
    ],
    image: "/why/Sunlit Herbal Tea and Botanicals.png",
    imageAlt:
      "A clear water droplet beside a mountain spring and fresh tea leaf, symbolizing natural purity",
  },
  // {
  //   id: "trust",
  //   eyebrow: "Trust",
  //   heading: "A Ritual Worth Returning To",
  //   description:
  //     "From checkout to the first sip, Finasto is built around the small moments of calm people come back for. Ordering is simple, delivery is careful, and every cup is meant to slow your day down.",
  //   details: [
  //     "Fast guest checkout, no account required",
  //     "Packaged to preserve freshness in transit",
  //     "Designed for a daily moment of calm",
  //   ],
  //   image: "/why/Cozy Finasto Coffee.png",
  //   imageAlt:
  //     "A woman closing her eyes while breathing in the steam from a warm cup of tea",
  // },
];
// Add this to "@/data/home" (replace the copy with your real promises)
export const philosophyPromises = [
  {
    id: "natural",
    title: "Nature’s Finest Essence",
    description: "A refined collection of teas, coffees, and other beverages, where nature meets exceptional quality.",
  },
  {
    id: "tested",
    title: "Beyond Ordinary Taste",
    description: "Discover distinctive teas, coffees, and more, selected to bring character and refinement to every cup.",
  },
  {
    id: "handmade",
    title: "Quality You Can Trust",
    description: "Every detail reflects our commitment to quality, consistency, and thoughtful selection.",
  },
  {
    id: "delivery",
    title: "The Art of Every Moment",
    description: "Let every cup become a moment of calm, crafted to be savoured and remembered for years to come.",
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
    "Every cup deserves a moment of its own. Discover a simple ritual designed to help you slow down and savour the experience.",
  steps: [
    {
      id: "steep",
      title: " Prepare",
      description:
        "Prepare your chosen beverage with care, following the recommended instructions for the perfect cup.",
    },
    {
      id: "pause",
      title: "Pause",
      description:
        "Take a moment to slow down, cherish the warmth, and reconnect with yourself.",
    },
    {
      id: "savor",
      title: "Savor",
      description:
        "Enjoy every sip and appreciate the distinctive aroma, character, and taste of your chosen blend.",
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
