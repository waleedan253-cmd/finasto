// src/data/hero-banners.ts
// Put the three images in /public/hero/ with these exact file names.
// The headline, tagline and "Shop Now" button are already part of each image.

export const HERO_SLIDE_DURATION = 5000; // ms per slide, long enough to read the image text

export type HeroSlide = {
  id: string;
  image: string; // path inside /public
  imageAlt: string; // describes the image and the text inside it
  href: string; // where the whole banner links to
  accent: string; // progress bar color for this slide
};

export const heroSlides: HeroSlide[] = [
     {
    id: "calm",
    image: "/hero/Calm Blue Herbal Tea Still Life.png",
    imageAlt: "Discover the Calm in Every Sip. Herbal goodness, refreshing taste. Shop now.",
    href: "/shop",
    accent: "#0f2a6b",
  },
   {
    id: "calm",
    image: "/hero/Blue Moon Botanical Tea in a Moonlit Garden.png",
    imageAlt: "Discover the Calm in Every Sip. Herbal goodness, refreshing taste. Shop now.",
    href: "/shop",
    accent: "#0f2a6b",
  },
  {
    id: "floral",
    image: "/hero/Sip the Beauty of Nature.png",
    imageAlt: "A Cup of Pure Serenity. Natural tea, better mood. Shop now.",
    href: "/shop",
    accent: "#244a1e",
  },
 
  {
    id: "floral",
    image: "/hero/Pure Elegance in Every.png",
    imageAlt: "Sip the Beauty of Nature. Pure, refreshing, naturally yours. Shop now.",
    href: "/shop",
    accent: "#1f3f12",
  },
   
];