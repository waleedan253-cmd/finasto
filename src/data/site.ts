// Static data today, shaped so it can be swapped for Supabase-driven
// content later (e.g. `announcements` table, `countries` table) without
// changing the components that consume it.

export type NavLink = {
  label: string;
  href: string;
  children?: NavLink[];
};

export const primaryNav: NavLink[] = [
  { label: "Home", href: "/" },
   { label: "brand", href: "/brand" },
  { label: "Shop", href: "/shop" },
  // { label: "Our Story", href: "/our-story" },
  { label: "Track Order", href: "/track-order" },
  { label: "Contact", href: "/contact" },
];

export type Announcement = {
  id: string;
  message: string;
};

// Admin will later be able to add/rotate these; a single entry still
// renders correctly (marquee pauses being meaningful, message stays put).
export const announcements: Announcement[] = [
  {
    id: "launch-shipping",
    message: "Free shipping across Indonesia on your first order",
  },
];

export type Market = {
  countryCode: string;
  countryLabel: string;
  currencyCode: string;
};

export const activeMarket: Market = {
  countryCode: "ID",
  countryLabel: "Indonesia",
  currencyCode: "IDR",
};

export const availableMarkets: Market[] = [
  {
    countryCode: "ID",
    countryLabel: "Indonesia",
    currencyCode: "IDR",
  },
  {
    countryCode: "MY",
    countryLabel: "Malaysia",
    currencyCode: "MYR",
  },
   {
    countryCode: "TR",
    countryLabel: "Turkey",
    currencyCode: "TRY",
  },
  {
    countryCode: "US",
    countryLabel: "United States",
    currencyCode: "USD",
  },
  {
    countryCode: "GLOBAL",
    countryLabel: "Global",
    currencyCode: "USD",
  },

];

export type FooterColumn = {
  title: string;
  links: NavLink[];
};

export const footerColumns: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "Velora", href: "/shop" },
      { label: "Blue Moon", href: "/shop" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "About Finasto",
    links: [
      { label: "Our Story", href: "/our-story" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export type SocialLink = {
  label: string;
  href: string;
  icon: "instagram" | "facebook" | "tiktok" | "youtube";
};

export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/finasto.id", icon: "instagram" },
  { label: "Facebook", href: "https://www.facebook.com/finasto.id", icon: "facebook" },
  { label: "TikTok", href: "https://www.tiktok.com/@finasto.id", icon: "tiktok" },
  // { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
];
