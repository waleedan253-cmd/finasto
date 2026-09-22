"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { activeMarket, availableMarkets, primaryNav } from "@/data/site";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthModal } from "@/components/auth/auth-modal";
import { Flag } from "@/components/ui/flag";

/**
 * Primary storefront header. Compacts on scroll (84px -> 64px) with a
 * subtle elevation change. Cart count is a prop so it can be wired to
 * real cart state later; 0 renders no badge rather than a fake number.
 */
export function SiteHeader({ cartCount = 0 }: { cartCount?: number }) {
  const [isCompact, setIsCompact] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState(
    availableMarkets.find(
      (m) => m.currencyCode === activeMarket.currencyCode,
    ) ?? availableMarkets[0],
  );
  const marketRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setIsCompact(window.scrollY > 24);
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
          "sticky top-0 z-40 w-full border-b border-border bg-cream/95 backdrop-blur-sm transition-shadow duration-300",
          isCompact && "shadow-[0_1px_0_0_rgba(50,30,24,0.06)]",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-[1440px] items-center justify-between px-5 transition-[height] duration-300 ease-out sm:px-8",
            isCompact ? "h-[64px]" : "h-[80px]",
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
              width={160}
              height={120}
              priority
              className={cn(
                "w-auto transition-[height] duration-300 ease-out",
                isCompact ? "h-11" : "h-14",
              )}
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
                    className="relative flex items-center gap-1 font-sans text-[15px] text-espresso/85 transition-colors hover:text-espresso after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-copper after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100 group-focus-within:after:scale-x-100"
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180" />
                    )}
                  </Link>

                  {item.children && (
                    <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 transition-opacity duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      <ul className="w-52 overflow-hidden rounded-xl border border-border bg-cream py-1 shadow-lg">
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
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-sans text-[13px] text-espresso/80 transition-colors hover:border-copper hover:text-espresso"
                aria-label={`Market: ${selectedMarket.countryLabel}, currency ${selectedMarket.currencyCode}`}
                style={{
                  cursor: "pointer",
                }}
              >
                <Flag code={selectedMarket.countryCode} />
                <span>{selectedMarket.currencyCode}</span>
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
                  className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-cream py-1 shadow-lg"
                >
                  {availableMarkets.map((market) => {
                    const isSelected =
                      market.currencyCode === selectedMarket.currencyCode;
                    return (
                      <li
                        key={market.currencyCode}
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
                            setSelectedMarket(market);
                            setIsMarketOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left font-sans text-[14px] text-espresso/85 transition-colors hover:bg-espresso/5 hover:text-espresso"
                        >
                          <span className="flex items-center gap-3">
                            <Flag code={market.countryCode} />
                            {market.countryLabel} · {market.currencyCode}
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

            <IconButton
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
            </IconButton>

            <IconButton
              label="Account"
              className="hidden sm:inline-flex"
              onClick={() => setIsAuthOpen(true)}
            >
              <User
                style={{
                  cursor: "pointer",
                }}
                className="h-[19px] w-[19px]"
                strokeWidth={1.6}
              />
            </IconButton>

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
        onOpenAuth={() => setIsAuthOpen(true)}
      />
      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

function IconButton({
  children,
  label,
  className,
  onClick,
  expanded,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center text-espresso/85 transition-colors hover:text-espresso",
        className,
      )}
    >
      {children}
    </button>
  );
}
