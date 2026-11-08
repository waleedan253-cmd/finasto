"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, User, X } from "lucide-react";
import { activeMarket, primaryNav } from "@/data/site";
import Image from "next/image";
import { ThemeToggle } from "../ThemeToggle";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileNav({
  open,
  onClose,
  onOpenAuth,
}: {
  open: boolean;
  onClose: () => void;
  /** Opens the admin/affiliate sign-in modal; omit to hide the entry. */
  onOpenAuth?: () => void;
}) {
  const [expandedHref, setExpandedHref] = useState<string | null>(null);
const pathname = usePathname();

  useEffect(() => {
    if (!open) setExpandedHref(null);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-espresso-deep/30 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
  "fixed inset-y-0 right-0 z-50 flex h-full w-[86%] max-w-[360px] flex-col lg:hidden",
  "border-l border-copper/20 bg-cream/90",
  "shadow-[-12px_0_40px_rgba(0,0,0,0.08)]",
  "backdrop-blur-xl backdrop-saturate-150",
  "bg-pattern[radial-gradient(ellipse_20%_30%_at_0%_0%,rgba(134,239,172,0.18),transparent_10%),radial-gradient(ellipse_20%_30%_at_100%_0%,rgba(125,211,252,0.16),transparent_10%)]",
  "transition-transform duration-300 ease-in-out",
)}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="flex items-center justify-between border-b border-copper/20 px-5 py-4">
              <span className="font-display text-xl text-espresso">
                {" "}
                <Link
                  href="/"
                  className="flex shrink-0 items-center"
                  aria-label="Finasto home"
                >
                  <Image
                    src="/brand/finasto-logo.png"
                    alt="Finasto"
                    width={120}
                    height={120}
                    priority
                    className="h-11 w-auto dark:hidden"
                  />
                  <Image
                    src="/brand/finasto-logo-dark.png"
                    alt="Finasto"
                    width={120}
                    height={90}
                    priority
                    className="hidden h-11 w-auto dark:block"
                  />
                </Link>
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center text-espresso"
              >
                <X
                  className="h-6 w-6"
                  strokeWidth={1.6}
                  style={{
                    cursor: "pointer",
                  }}
                />
              </button>
            </div>

            <nav
              aria-label="Mobile primary"
              className="flex-1 overflow-y-auto px-5 py-4"
            >
              <ul
                className="flex flex-col"
                style={{
                  cursor: "pointer",
                }}
              >
                {primaryNav.map((item) => {
                  const children = item.children;
                  const isExpanded = expandedHref === item.href;

                  return (
                    <li
                      key={item.href}
                      className="border-b border-border/70"
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      {children && children.length > 0 ? (
                        <>
                         <button
  style={{
    cursor: "pointer",
  }}
  type="button"
  onClick={() =>
    setExpandedHref(isExpanded ? null : item.href)
  }
  aria-expanded={isExpanded}
  className="group my-1 flex min-h-[48px] w-full items-center justify-between font-sans text-[17px] font-medium text-espresso/85"
>
  <span
    className={cn(
      "relative flex min-h-[48px] items-center rounded-full px-4 transition-colors group-hover:text-espresso",
      "after:absolute after:-bottom-1 after:left-4 after:right-4 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-copper after:transition-transform after:duration-500 after:ease-out group-hover:after:scale-x-100 group-active:after:scale-x-100 group-focus-visible:after:scale-x-100",
      isActive(pathname, item.href) &&
        "bg-green-deep font-semibold text-cream shadow-[0_6px_16px_-6px_rgba(35,77,42,0.55)] after:hidden group-hover:text-cream",
    )}
  >
    {item.label}
  </span>
  <ChevronDown
    className={`mr-2 h-5 w-5 transition-transform duration-200 ${
      isExpanded ? "rotate-180" : ""
    }`}
    strokeWidth={1.6}
  />
</button>
                          
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="overflow-hidden"
                              >
                                {children.map((child) => (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      onClick={onClose}
                                      className={cn(
  "relative flex min-h-[46px] items-center pl-6 font-sans text-[15px] text-espresso/85 transition-colors hover:text-espresso active:bg-espresso/5",
  "after:absolute after:bottom-1.5 after:left-6 after:right-4 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-copper after:transition-transform after:duration-500 after:ease-out hover:after:scale-x-100 active:after:scale-x-100 focus-visible:after:scale-x-100",
  isActive(pathname, child.href) && "font-semibold text-copper",
)}
                                    >
                                      {child.label}
                                    </Link>
                                  </li>
                                ))} 
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                       <Link
  href={item.href}
  onClick={onClose}
  aria-current={isActive(pathname, item.href) ? "page" : undefined}
  className={cn(
    "relative my-1 flex w-fit min-h-[48px] items-center rounded-full px-4 font-sans text-[17px] font-medium text-espresso/85 transition-colors hover:text-espresso",
    "after:absolute after:-bottom-1 after:left-4 after:right-4 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-copper after:transition-transform after:duration-500 after:ease-out hover:after:scale-x-100 active:after:scale-x-100 focus-visible:after:scale-x-100",
    isActive(pathname, item.href) &&
      "bg-green-deep font-semibold text-cream shadow-[0_6px_16px_-6px_rgba(35,77,42,0.55)] after:hidden hover:text-cream",
  )}
>
                          {item.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

           <div className="border-t border-copper/20 px-5 py-4">
  
  {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="mb-3 flex min-h-[44px] w-full items-center gap-2 font-sans text-[15px] text-espresso"
                >
                  <User
                    className="h-[18px] w-[18px] text-copper"
                    strokeWidth={1.6}
                  />
                  <span className="text-espresso/85">Sign in</span>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
function isActive(pathname: string, href: string) {
  const path = href.split("?")[0].split("#")[0];
  return path === "/"
    ? pathname === "/"
    : pathname === path || pathname.startsWith(path + "/");
}