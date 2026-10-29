// src/data/hero-slides.ts
// Four hero slides. Text stays real HTML (SEO); only the video is media.

export type HeroFeature = {
  icon: "leaf" | "sun" | "sprout" | "globe" | "handshake" | "shield" | "steam" | "award" | "hand" | "package";
  label: string;
};

export type HeroSlide = {
  id: string;
  eyebrow: string;
  headline: [string, string];
  body: string;
  features: HeroFeature[];
  cta: { label: string; href: string };
  image: string; // path inside /public
  imageAlt: string; // accessible description of the image
};

export const HERO_SLIDE_DURATION = 3000; // ms per slide, 24s full loop

export const heroSlides: HeroSlide[] = [
  {
    id: "harvest",
    eyebrow: "It all begins",
    headline: ["From Bali’s Rich ", "Soil"],
    body: "Our journey starts in the fertile highlands of Bali, where nature, tradition and hard work come together to grow the finest tea leaves and coffee beans.",
    features: [
      { icon: "leaf", label: "Rich Soil" },
      { icon: "sun", label: "Temperate" },
      { icon: "sprout", label: "Agroecology" },
    ],
    cta: { label: "Shop Bali-Grown Teas", href: "/shop" },
    image: "/hero/bali-tea-harvest.jpg",
    imageAlt: "Farmers hand-picking tea leaves on a Bali hillside at sunrise",
  },
  
  {
    id: "fresh-leaves",
    eyebrow: "Crafted with care",
    headline: ["From Fresh Leaves", "to Finest Quality"],
    body: "Our leaves are carefully harvested and gently processed using traditional methods, preserving their natural flavor, aroma and goodness.",
    features: [
      { icon: "leaf", label: "Traditional Processing" },
      { icon: "steam", label: "Natural Aroma" },
      { icon: "shield", label: "Pure & Authentic" },
      { icon: "award", label: "Premium Quality" },
    ],
    cta: { label: "Shop Premium Teas", href: "/shop" },
    image: "/hero/fresh-leaves.jpg",
    imageAlt: "Worker sorting fresh tea leaves on bamboo trays",
  },
  {
    id: "morning-leaves",
    eyebrow: "Tradition in every step",
    headline: ["Withered by Hand,", "Rich in Aroma"],
    body: "Each morning our artisans turn and wither the leaves by hand on bamboo trays in the Bali sun, building the depth of flavor that makes every cup unforgettable.",
    features: [
      { icon: "hand", label: "Hand Crafted" },
      { icon: "sun", label: "Sun Withered" },
      { icon: "package", label: "Small Batch" },
      { icon: "award", label: "Premium Quality" },
    ],
    cta: { label: "Shop Small-Batch Teas", href: "/shop" },
    image: "/hero/morning-leaves.jpg",
    imageAlt: "Artisan turning tea leaves by hand on bamboo trays in morning sun",
  },
  {
    id: "bali-heart",
    eyebrow: "Premium coffee & tea",
    headline: ["From Bali’s Heart", "to Your Cup"],
    body: "Pure, authentic and full of character — our coffee and tea bring the essence of Bali’s rich land, traditional craftsmanship and natural goodness to the world.",
    features: [
      { icon: "leaf", label: "Premium Quality" },
      { icon: "globe", label: "Global Reach" },
      { icon: "handshake", label: "Fair Trade" },
      { icon: "sprout", label: "Sustainable Future" },
    ],
    cta: { label: "Explore Our Products", href: "/shop" },
    image: "/hero/bali-heart.jpg",
    imageAlt: "Finasto Bali coffee and tea with steaming cups on a wooden table",
  },
];