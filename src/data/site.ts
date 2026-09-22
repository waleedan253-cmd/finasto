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
  { label: "Shop", href: "/shop" },
  { label: "Our Story", href: "/our-story" },
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

// Markets the switcher is built to support once enabled; only
// `activeMarket` is selectable at launch.
export const availableMarkets: Market[] = [activeMarket];

export type FooterColumn = {
  title: string;
  links: NavLink[];
};

export const footerColumns: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "Shop", href: "/shop" },
      { label: "Velora", href: "/shop/velora" },
      { label: "Blue Moon", href: "/shop/blue-moon" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "Payment Options", href: "/payment-options" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "About Finasto",
    links: [
      { label: "Our Story", href: "/our-story" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Blog", href: "/blog" },
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
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
  { label: "TikTok", href: "https://tiktok.com", icon: "tiktok" },
  { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
];
