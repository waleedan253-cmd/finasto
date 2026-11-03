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
  theme: { eyebrow: string; heading: string; body: string; button: string };
};

export const HERO_SLIDE_DURATION = 3000; // ms per slide, 24s full loop

export const heroSlides: HeroSlide[] = [
   {
  id: "golden-hour",
  eyebrow: "Classic  Tea",
  headline: ["A Standard Beyond the Ordinary.", ""],
  body: "Discover  FINASTO™_ A Throughtfully Curated Collection of teas inspired by nature and quality.",
  features: [
    { icon: "hand", label: "Hand Crafted" },
    { icon: "package", label: "Small Batch" },
    { icon: "award", label: "Premium Quality" },
  ],
  cta: { label: "Shop Now Teas", href: "/shop" },
  image: "/hero/brand.jpeg", // file must exist in public/hero/
  imageAlt: "A Standard Beyond the Ordinary",
  theme: { eyebrow: "#ffff", heading: "#7A3E00", body: "#1F1B16", button: "#7A3E00" },
},
  {
    id: "harvest",
    eyebrow: "Floral Tropical Infusion",
    headline: ["Let Nature Blossom in Every Sip. ", ""],
    body: "Elegant and softly floral, with a fresh tropical touch and a beautifully smooth, uplifting finish.",
    features: [
      { icon: "leaf", label: "Rich Soil" },
      { icon: "sun", label: "Temperate" },
      { icon: "sprout", label: "Agroecology" },
    ],
    cta: { label: "Shop Bali-Grown Teas", href: "/shop" },
    image: "/hero/flovera.jpeg",
    imageAlt: "Farmers hand-picking tea leaves on a Bali hillside at sunrise",
    theme: { eyebrow: "#ffff", heading: "#2F6B34", body: "#1F1B16", button: "#2F6B34" }
  },
  
  {
    id: "fresh-leaves",
    eyebrow: "Floral Herbal Infusion",
    headline: ["Discover a Different Kind of Blue.", ""],
    body: "A distinctive botanical infusion featuring flowers and carefully selected herbs.",
    features: [
      { icon: "leaf", label: "Traditional Processing" },
      { icon: "steam", label: "Natural Aroma" },
      { icon: "shield", label: "Pure & Authentic" },
      { icon: "award", label: "Premium Quality" },
    ],
    cta: { label: "Shop Premium Teas", href: "/shop" },
    image: "/hero/blue-moon.jpeg",
    imageAlt: "Worker sorting fresh tea leaves on bamboo trays",
    theme: { eyebrow: "#ffff", heading: "#0F2A6B", body: "#1F1B16", button: "#0B2E73" },
  },
 
  // {
  //   id: "morning-leaves",
  //   eyebrow: "Tradition in every step",
  //   headline: ["Withered by Hand,", "Rich in Aroma"],
  //   body: "Each morning our artisans turn and wither the leaves by hand on bamboo trays in the Bali sun, building the depth of flavor that makes every cup unforgettable.",
  //   features: [
  //     { icon: "hand", label: "Hand Crafted" },
  //     { icon: "sun", label: "Sun Withered" },
  //     { icon: "package", label: "Small Batch" },
  //     { icon: "award", label: "Premium Quality" },
  //   ],
  //   cta: { label: "Shop Small-Batch Teas", href: "/shop" },
  //   image: "/hero/morning-leaves.jpg",
  //   imageAlt: "Artisan turning tea leaves by hand on bamboo trays in morning sun",
  // },
 
];