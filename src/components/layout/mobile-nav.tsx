"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, User, X } from "lucide-react";
import { activeMarket, primaryNav } from "@/data/site";
import Image from "next/image";

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
            className="fixed inset-0 z-50 bg-espresso-deep/40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-[86%] max-w-[360px] flex-col bg-cream-soft shadow-xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
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
                    width={60}
                    height={70}
                    priority
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
                            className="flex min-h-[52px] w-full items-center justify-between font-sans text-[17px] text-espresso"
                          >
                            {item.label}
                            <ChevronDown
                              className={`h-5 w-5 transition-transform duration-200 ${
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
                                      className="flex min-h-[46px] items-center pl-4 font-sans text-[15px] text-espresso/80 transition-colors active:bg-espresso/5 active:text-espresso"
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
                          className="flex min-h-[52px] items-center font-sans text-[17px] text-espresso"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-border px-5 py-4">
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
                    className="h-[18px] w-[18px]"
                    strokeWidth={1.6}
                    style={{
                      cursor: "pointer",
                    }}
                  />
                  sign in
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
