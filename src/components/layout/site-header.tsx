"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  Check,
  ChevronDown,
    Globe,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { availableMarkets, primaryNav } from "@/data/site";
import { useMarket } from "@/components/providers/market-provider";
import { useCart } from "@/components/providers/cart-provider";
import { MobileNav } from "@/components/layout/mobile-nav";
// import { AuthModal } from "@/components/auth/auth-modal";
import { GlobalOutlined } from "@ant-design/icons";
import { Flag } from "@/components/ui/flag";
// import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Primary storefront header. Compacts on scroll (84px -> 64px) with a
 * subtle elevation change. Cart count is a prop so it can be wired to
 * real cart state later; 0 renders no badge rather than a fake number.
 */
export function SiteHeader() {
  const [isCompact, setIsCompact] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { market: selectedMarket, setMarket } = useMarket();
  const { count, openCart } = useCart();
  const marketRef = useRef<HTMLDivElement>(null);
const router = useRouter();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Hysteresis: shrink after 80px, expand again only below 10px.
    // The 70px gap is wider than the 20px height change (90 -> 70),
    // so shrinking the header can never push scrollY back across the trigger.
    const onScroll = () => {
      const y = window.scrollY;
      setIsCompact((prev) => (y > 80 ? true : y < 10 ? false : prev));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!isMarketOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!marketRef.current?.contains(e.target as Node)) {
        setIsMarketOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMarketOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMarketOpen]);
  useEffect(() => {
    if (!isSearchOpen) return;
    searchInputRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSearchOpen]);

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  }
  return (
    <>
      <header
        className={cn(
          "bg-pattern !sticky top-0 z-40 w-full border-b border-copper/20 bg-cream/80 backdrop-blur-xl backdrop-saturate-150 transition-[box-shadow,background-color] duration-300",
          "bg-[radial-gradient(ellipse_40%_120%_at_0%_0%,rgba(134,239,172,0.18),transparent_70%),radial-gradient(ellipse_40%_120%_at_100%_0%,rgba(125,211,252,0.16),transparent_70%)]",
          isCompact &&
            "bg-cream/90 shadow-[0_10px_30px_-12px_rgba(35,77,42,0.25)]",
        )}
      > 
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-copper/60 to-transparent"
        />
        <div
          className={cn(
            "mx-auto flex max-w-[1440px] items-center justify-between px-5 transition-[height] duration-300 ease-out sm:px-8",
            isCompact ? "h-[70px]" : "h-[90px]",
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="Finasto home"
          >
            <Image
              src="/brand/finasto-logo.png"
              alt="Finasto"
              width={120}
              height={90}
              priority
              className="h-16 w-auto dark:hidden"
            />
            <Image
              src="/brand/finasto-logo-dark.png"
              alt="Finasto"
              width={120}
              height={90}
              priority
              className="hidden h-16 w-auto dark:block"
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden h-full lg:block">
            <ul className="flex h-full items-center gap-9">
              {primaryNav.map((item) => (
                <li
                  key={item.href}
                  className="group relative flex h-full items-center"
                >
                                   <Link
                    href={item.href}
                    aria-current={
                      isActive(pathname, item.href) ? "page" : undefined
                    }
                    className={cn(
                      "relative flex items-center gap-1 rounded-full px-4 py-2 font-sans text-[15px] font-medium tracking-[0.01em] text-espresso/85 transition-colors duration-300 hover:text-espresso after:absolute after:-bottom-1 after:left-4 after:right-4 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-copper after:transition-transform after:duration-500 after:ease-out group-hover:after:scale-x-100 group-focus-within:after:scale-x-100",
                      isActive(pathname, item.href) &&
                        "bg-green-deep font-semibold text-cream shadow-[0_6px_16px_-6px_rgba(35,77,42,0.55)] after:hidden",
                    )}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180" />
                    )}
                  </Link>

                  {item.children && (
                    <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 transition-opacity duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      <ul className="w-52 overflow-hidden rounded-xl border border-copper/25 bg-cream/95 py-1 shadow-[0_20px_40px_-15px_rgba(35,77,42,0.35)] backdrop-blur-xl">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block px-4 py-2.5 font-sans text-[14px] text-espresso/85 transition-colors hover:bg-espresso/5 hover:text-espresso"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Utility cluster */}
          <div className="flex items-center gap-1 sm:gap-2">
           
            <div ref={marketRef} className="relative block">
              <button
                type="button"
                onClick={() => setIsMarketOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isMarketOpen}
                className="flex items-center gap-1.5 rounded-full border border-copper/30 bg-white/50 px-3 py-1.5 font-sans text-[13px] text-espresso/80 backdrop-blur transition-colors hover:border-copper hover:bg-white/80 hover:text-espresso"
                aria-label={`Market: ${selectedMarket.countryLabel}, currency ${selectedMarket.currencyCode}`}
                style={{
                  cursor: "pointer",
                  color:"#7A3E00"
                }}
              >
                                <MarketIcon code={selectedMarket.countryCode} />
                {/* <span>{selectedMarket.currencyCode}</span> */}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    isMarketOpen && "rotate-180",
                  )}
                />
              </button>

              {isMarketOpen && (
                <ul
                  role="listbox"
                  className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-copper/25 bg-cream/95 py-1 shadow-[0_20px_40px_-15px_rgba(35,77,42,0.35)] backdrop-blur-xl"
                >
                  {availableMarkets.map((market) => {
                                       const isSelected =
                      market.countryCode === selectedMarket.countryCode;
                    return (
                      <li
                        key={market.countryCode}
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        <button
                          style={{
                            cursor: "pointer",
                          }}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setMarket(market);
                            setIsMarketOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left font-sans text-[14px] text-espresso/85 transition-colors hover:bg-espresso/5 hover:text-espresso"
                        >
                          <span className="flex items-center gap-3">
                                                    <MarketIcon code={market.countryCode} />
                            {market.countryLabel}
                          </span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-copper" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* <IconButton
              label="Search"
              expanded={isSearchOpen}
              onClick={() => {
                setIsMarketOpen(false);
                setIsSearchOpen((prev) => !prev);
              }}
            >
              <Search
                style={{
                  cursor: "pointer",
                }}
                className="h-[19px] w-[19px]"
                strokeWidth={1.6}
              />
            </IconButton> */}

           <IconButton
  label="Account"
  href="/sign-in"
  className="hidden sm:inline-flex"
>
  <User
    className="h-[19px] w-[19px] text-copper"
    strokeWidth={1.6}
  />
</IconButton>
            <button
              type="button"
              onClick={() => {
                setIsMarketOpen(false);
                setIsSearchOpen(false);
                openCart();
              }}
              aria-label={count > 0 ? `Open bag, ${count} items` : "Open bag"}
              className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full text-espresso/85 transition-all duration-300 hover:text-espresso active:scale-90 [-webkit-tap-highlight-color:transparent]"
              style={{ cursor: "pointer" }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-1 scale-50 rounded-full bg-green/15 opacity-0 ring-1 ring-green/40 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100 group-active:scale-100 group-active:opacity-100"
              />
              <ShoppingBag
                key={count}
                className="relative h-[19px] w-[19px] animate-[finasto-bag-bump_350ms_ease-out] text-green transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 group-active:-rotate-12 group-active:scale-110"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              {count > 0 && (
                <span
                  key={`badge-${count}`}
                  className="absolute right-1 top-1 flex h-[18px] min-w-[18px] animate-[finasto-bag-bump_350ms_ease-out] items-center justify-center rounded-full bg-copper px-1 font-sans text-[10px] font-semibold text-white"
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="ml-1 inline-flex h-11 w-11 items-center justify-center text-espresso lg:hidden"
              aria-label="Open menu"
              style={{ cursor: "pointer" }}
            >
              <Menu className="h-6 w-6" strokeWidth={1.6} />
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-x-0 top-full border-b border-border bg-cream shadow-lg"
          >
            <form
              role="search"
              onSubmit={handleSearchSubmit}
              className="mx-auto flex max-w-[1440px] items-center gap-3 px-5 py-4 sm:px-8"
            >
              <Search
                className="h-5 w-5 shrink-0 text-espresso/60"
                strokeWidth={1.6}
              />
              <input
                ref={searchInputRef}
                type="text"
                enterKeyHint="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                aria-label="Search products"
                className="h-11 w-full bg-transparent font-sans text-[16px] text-espresso placeholder:text-espresso/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-espresso/70 transition-colors hover:text-espresso"
              >
                <X
                  className="h-5 w-5"
                  strokeWidth={1.6}
                  style={{
                    cursor: "pointer",
                  }}
                />
              </button>
            </form>
          </motion.div>
        )}
      </header>

      {isSearchOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 z-30 bg-espresso/30"
        />
      )}

     <MobileNav
  open={isMobileNavOpen}
  onClose={() => setIsMobileNavOpen(false)}
  onOpenAuth={() => {
    setIsMobileNavOpen(false);
    router.push("/sign-in");
  }}
/>
      {/* <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} /> */}
    </>
  );
}

function MarketIcon({ code }: { code: string }) {
  if (code === "GLOBAL") {
    return <GlobalOutlined style={{ fontSize: 16 }} aria-hidden="true" />;
  }
  return <Flag code={code} />;
}

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0].split("#")[0];
  return path === "/"
    ? pathname === "/"
    : pathname === path || pathname.startsWith(path + "/");
}

function IconButton({
  children,
  label,
  className,
  onClick,
  expanded,
  href,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
  expanded?: boolean;
  href?: string;
}) {
  const classes = cn(
    "group relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-espresso/85 transition-all duration-300 hover:text-espresso active:scale-90 [-webkit-tap-highlight-color:transparent]",
    className,
  );
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-1 scale-50 rounded-full bg-copper/15 opacity-0 ring-1 ring-copper/40 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100 group-active:scale-100 group-active:opacity-100"
      />
      <span className="relative transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 group-active:scale-110">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
      className={classes}
    >
      {inner}
    </button>
  );
}
