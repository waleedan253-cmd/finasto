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
  {
    label: "Shop",
    href: "/shop",
    children: [
      { label: "All Products", href: "/shop" },
      { label: "Tea ", href: "/shop?sort=new" },
      { label: "Coffee", href: "/shop?sort=best" },
    ],
  },
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

// Markets the switcher supports. Trim this back to [activeMarket]
// if only Indonesia should be selectable at launch.
export const availableMarkets: Market[] = [
  activeMarket,
  { countryCode: "US", countryLabel: "United States", currencyCode: "USD" },
  { countryCode: "SG", countryLabel: "Singapore", currencyCode: "SGD" },
  { countryCode: "MY", countryLabel: "Malaysia", currencyCode: "MYR" },
];
