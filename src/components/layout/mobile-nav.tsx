// // "use client";
// // import { useEffect, useState } from "react";
// // import Link from "next/link";
// // import { AnimatePresence, motion } from "motion/react";
// // import { ChevronDown, User, X } from "lucide-react";
// // import { activeMarket, primaryNav } from "@/data/site";
// // import Image from "next/image";
// // import { ThemeToggle } from "../ThemeToggle";
// // import { usePathname } from "next/navigation";
// // import { cn } from "@/lib/utils";

// // export function MobileNav({
// //   open,
// //   onClose,
// //   onOpenAuth,
// // }: {
// //   open: boolean;
// //   onClose: () => void;
// //   /** Opens the admin/affiliate sign-in modal; omit to hide the entry. */
// //   onOpenAuth?: () => void;
// // }) {
// //   const [expandedHref, setExpandedHref] = useState<string | null>(null);
// // const pathname = usePathname();

// //   useEffect(() => {
// //     if (!open) setExpandedHref(null);
// //   }, [open]);

// //   return (
// //     <AnimatePresence>
// //       {open && (
// //         <>
// //           <motion.div
// //             initial={{ opacity: 0 }}
// //             animate={{ opacity: 1 }}
// //             exit={{ opacity: 0 }}
// //             transition={{ duration: 0.25 }}
// //             className="fixed inset-0 z-50 bg-espresso-deep/30 backdrop-blur-sm lg:hidden"
// //             onClick={onClose}
// //             aria-hidden="true"
// //           />
// //           <motion.div
// //             initial={{ x: "100%" }}
// //             animate={{ x: 0 }}
// //             exit={{ x: "100%" }}
// //             transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
// //    className={cn(
// //   "fixed inset-y-0 right-0 z-50 flex h-full w-[86%] max-w-[360px] flex-col lg:hidden",
// //   "border-l border-copper/20 bg-cream/95 shadow-xl backdrop-blur-xl backdrop-saturate-150",
// //   "bg-[radial-gradient(ellipse_80%_30%_at_0%_0%,rgba(134,239,172,0.18),transparent_70%),radial-gradient(ellipse_80%_30%_at_100%_0%,rgba(125,211,252,0.16),transparent_70%)]",
// // )}
// //             role="dialog"
// //             aria-modal="true"
// //             aria-label="Site menu"
// //           >
// //             <div className="flex items-center justify-between border-b border-copper/20 px-5 py-4">
// //               <span className="font-display text-xl text-espresso">
// //                 {" "}
// //                 <Link
// //                   href="/"
// //                   className="flex shrink-0 items-center"
// //                   aria-label="Finasto home"
// //                 >
// //                   <Image
// //                     src="/brand/finasto-logo.png"
// //                     alt="Finasto"
// //                     width={120}
// //                     height={120}
// //                     priority
// //                     className="h-11 w-auto dark:hidden"
// //                   />
// //                   <Image
// //                     src="/brand/finasto-logo-dark.png"
// //                     alt="Finasto"
// //                     width={120}
// //                     height={90}
// //                     priority
// //                     className="hidden h-11 w-auto dark:block"
// //                   />
// //                 </Link>
// //               </span>
// //               <button
// //                 type="button"
// //                 onClick={onClose}
// //                 aria-label="Close menu"
// //                 className="flex h-11 w-11 items-center justify-center text-espresso"
// //               >
// //                 <X
// //                   className="h-6 w-6"
// //                   strokeWidth={1.6}
// //                   style={{
// //                     cursor: "pointer",
// //                   }}
// //                 />
// //               </button>
// //             </div>

// //             <nav
// //               aria-label="Mobile primary"
// //               className="flex-1 overflow-y-auto px-5 py-4"
// //             >
// //               <ul
// //                 className="flex flex-col"
// //                 style={{
// //                   cursor: "pointer",
// //                 }}
// //               >
// //                 {primaryNav.map((item) => {
// //                   const children = item.children;
// //                   const isExpanded = expandedHref === item.href;

// //                   return (
// //                     <li
// //                       key={item.href}
// //                       className="border-b border-border/70"
// //                       style={{
// //                         cursor: "pointer",
// //                       }}
// //                     >
// //                       {children && children.length > 0 ? (
// //                         <>
// //                          <button
// //   style={{
// //     cursor: "pointer",
// //   }}
// //   type="button"
// //   onClick={() =>
// //     setExpandedHref(isExpanded ? null : item.href)
// //   }
// //   aria-expanded={isExpanded}
// //   className="group my-1 flex min-h-[48px] w-full items-center justify-between font-sans text-[17px] font-medium text-espresso/85"
// // >
// //   <span
// //     className={cn(
// //       "relative flex min-h-[48px] items-center rounded-full px-4 transition-colors group-hover:text-espresso",
// //       "after:absolute after:-bottom-1 after:left-4 after:right-4 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-copper after:transition-transform after:duration-500 after:ease-out group-hover:after:scale-x-100 group-active:after:scale-x-100 group-focus-visible:after:scale-x-100",
// //       isActive(pathname, item.href) &&
// //         "bg-green-deep font-semibold text-cream shadow-[0_6px_16px_-6px_rgba(35,77,42,0.55)] after:hidden group-hover:text-cream",
// //     )}
// //   >
// //     {item.label}
// //   </span>
// //   <ChevronDown
// //     className={`mr-2 h-5 w-5 transition-transform duration-200 ${
// //       isExpanded ? "rotate-180" : ""
// //     }`}
// //     strokeWidth={1.6}
// //   />
// // </button>
                          
// //                           <AnimatePresence initial={false}>
// //                             {isExpanded && (
// //                               <motion.ul
// //                                 initial={{ height: 0, opacity: 0 }}
// //                                 animate={{ height: "auto", opacity: 1 }}
// //                                 exit={{ height: 0, opacity: 0 }}
// //                                 transition={{ duration: 0.25, ease: "easeOut" }}
// //                                 className="overflow-hidden"
// //                               >
// //                                 {children.map((child) => (
// //                                   <li key={child.href}>
// //                                     <Link
// //                                       href={child.href}
// //                                       onClick={onClose}
// //                                       className={cn(
// //   "relative flex min-h-[46px] items-center pl-6 font-sans text-[15px] text-espresso/85 transition-colors hover:text-espresso active:bg-espresso/5",
// //   "after:absolute after:bottom-1.5 after:left-6 after:right-4 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-copper after:transition-transform after:duration-500 after:ease-out hover:after:scale-x-100 active:after:scale-x-100 focus-visible:after:scale-x-100",
// //   isActive(pathname, child.href) && "font-semibold text-copper",
// // )}
// //                                     >
// //                                       {child.label}
// //                                     </Link>
// //                                   </li>
// //                                 ))} 
// //                               </motion.ul>
// //                             )}
// //                           </AnimatePresence>
// //                         </>
// //                       ) : (
// //                        <Link
// //   href={item.href}
// //   onClick={onClose}
// //   aria-current={isActive(pathname, item.href) ? "page" : undefined}
// //   className={cn(
// //     "relative my-1 flex w-fit min-h-[48px] items-center rounded-full px-4 font-sans text-[17px] font-medium text-espresso/85 transition-colors hover:text-espresso",
// //     "after:absolute after:-bottom-1 after:left-4 after:right-4 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-copper after:transition-transform after:duration-500 after:ease-out hover:after:scale-x-100 active:after:scale-x-100 focus-visible:after:scale-x-100",
// //     isActive(pathname, item.href) &&
// //       "bg-green-deep font-semibold text-cream shadow-[0_6px_16px_-6px_rgba(35,77,42,0.55)] after:hidden hover:text-cream",
// //   )}
// // >
// //                           {item.label}
// //                         </Link>
// //                       )}
// //                     </li>
// //                   );
// //                 })}
// //               </ul>
// //             </nav>

// //            <div className="border-t border-copper/20 px-5 py-4">
  
// //   {onOpenAuth && (
// //                 <button
// //                   type="button"
// //                   onClick={() => {
// //                     onClose();
// //                     onOpenAuth();
// //                   }}
// //                   className="mb-3 flex min-h-[44px] w-full items-center gap-2 font-sans text-[15px] text-espresso"
// //                 >
// //                   <User
// //                     className="h-[18px] w-[18px] text-copper-deep"
// //                     strokeWidth={1.6}
// //                   />
// //                   <span className="text-espresso/85 cursor-pointer">Sign in</span>
// //                 </button>
// //               )}
// //             </div>
// //           </motion.div>
// //         </>
// //       )}
// //     </AnimatePresence>
// //   );
// // }
// // function isActive(pathname: string, href: string) {
// //   const path = href.split("?")[0].split("#")[0];
// //   return path === "/"
// //     ? pathname === "/"
// //     : pathname === path || pathname.startsWith(path + "/");
// // }

// "use client";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import { AnimatePresence, motion, useReducedMotion } from "motion/react";
// import {
//   BookOpen,
//   ChevronDown,
//   Coffee,
//   Home,
//   Info,
//   Leaf,
//   Mail,
//   Package,
//   ShoppingBag,
//   Sparkles,
//   Store,
//   User,
//   Users,
//   X,
//   type LucideIcon,
// } from "lucide-react";
// import { primaryNav } from "@/data/site";
// import { cn } from "@/lib/utils";

// /**
//  * Icon lookup: matches keywords in the nav label/href, so `primaryNav`
//  * doesn't need to change. First match wins; Leaf is the fallback.
//  */
// const ICON_RULES: [RegExp, LucideIcon][] = [
//   [/^\s*home|^\s*\/\s*$/, Home],
//   [/about|story|our-?brand/, Info],
//   [/tea|coffee|brew|blend|flovera|blue-?moon/, Coffee],
//   [/product|collection|range|catalog/, Package],
//   [/shop|store|buy|order/, ShoppingBag],
//   [/market|distribut|partner|wholesale|b2b|export/, Store],
//   [/affiliate|team|community|people/, Users],
//   [/blog|journal|news|article|learn/, BookOpen],
//   [/contact|support|reach|mail/, Mail],
//   [/offer|new|special|launch/, Sparkles],
// ];

// function getNavIcon(label: string, href: string): LucideIcon {
//   const key = `${label} ${href}`.toLowerCase();
//   for (const [pattern, Icon] of ICON_RULES) {
//     if (pattern.test(key)) return Icon;
//   }
//   return Leaf;
// }

// function isActive(pathname: string, href: string) {
//   const path = href.split("?")[0].split("#")[0];
//   return path === "/"
//     ? pathname === "/"
//     : pathname === path || pathname.startsWith(path + "/");
// }

// /** Fine paper grain, blended over the panel so the coffee tone feels tactile */
// const GRAIN =
//   "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

// export function MobileNav({
//   open,
//   onClose,
//   onOpenAuth,
// }: {
//   open: boolean;
//   onClose: () => void;
//   /** Opens the admin/affiliate sign-in modal; omit to hide the entry. */
//   onOpenAuth?: () => void;
// }) {
//   const [expandedHref, setExpandedHref] = useState<string | null>(null);
//   const pathname = usePathname();
//   const reduceMotion = useReducedMotion();

//   // Collapse any open submenu when the sidebar closes
//   useEffect(() => {
//     if (!open) setExpandedHref(null);
//   }, [open]);

//   // Lock page scroll + close on Escape while the sidebar is open
//   useEffect(() => {
//     if (!open) return;
//     const previousOverflow = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => {
//       document.body.style.overflow = previousOverflow;
//       window.removeEventListener("keydown", onKey);
//     };
//   }, [open, onClose]);

//   return (
//     <AnimatePresence>
//       {open && (
//         <>
//           {/* Backdrop */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.25 }}
//             className="fixed inset-0 z-50 cursor-pointer bg-[#140b07]/65 backdrop-blur-sm lg:hidden"
//             onClick={onClose}
//             aria-hidden="true"
//           />

//           {/* Sidebar: coffee base, green glow top-left, copper glow bottom-right */}
//           <motion.div
//             initial={{ x: "100%" }}
//             animate={{ x: 0 }}
//             exit={{ x: "100%" }}
//             transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
//             className={cn(
//               "fixed inset-y-0 right-0 z-50 flex h-full w-[86%] max-w-[360px] flex-col overflow-hidden lg:hidden",
//               "bg-[#1f120b] text-cream shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.7)]",
//               "bg-[radial-gradient(ellipse_110%_52%_at_0%_0%,rgba(134,239,172,0.46),rgba(110,200,140,0.16)_45%,transparent_74%),radial-gradient(ellipse_70%_35%_at_0%_100%,rgba(111,191,130,0.22),transparent_70%),radial-gradient(ellipse_80%_30%_at_100%_100%,rgba(184,115,51,0.22),transparent_70%)]",
//             )}
//             role="dialog"
//             aria-modal="true"
//             aria-label="Site menu"
//           >
//             {/* Paper grain */}
//             <div
//               aria-hidden="true"
//               className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
//               style={{ backgroundImage: GRAIN }}
//             />

//             {/* Copper-foil edge along the left side */}
//             <span
//               aria-hidden="true"
//               className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#e0a56b] to-transparent"
//             />

//             {/* Botanical leaves: clearly visible, still behind the content */}
//             <Leaf
//               aria-hidden="true"
//               className="pointer-events-none absolute -right-6 top-24 h-44 w-44 rotate-[25deg] text-[#9be0ac]/30"
//               strokeWidth={1.1}
//             />
//             <Leaf
//               aria-hidden="true"
//               className="pointer-events-none absolute right-24 top-[46%] h-24 w-24 -rotate-[15deg] text-[#9be0ac]/20"
//               strokeWidth={1.1}
//             />
//             <Leaf
//               aria-hidden="true"
//               className="pointer-events-none absolute -bottom-8 -left-6 h-60 w-60 -rotate-[30deg] text-[#9be0ac]/30"
//               strokeWidth={1.1}
//             />

//             {/* Header */}
//             <div className="relative flex items-center justify-between px-6 pb-5 pt-5">
//               <Link
//                 href="/"
//                 onClick={onClose}
//                 className="flex shrink-0 items-center"
//                 aria-label="Finasto home"
//               >
//                 {/* Sidebar is always dark, so use the dark-mode logo only */}
//                 <Image
//                   src="/brand/finasto-logo-dark.png"
//                   alt="Finasto"
//                   width={120}
//                   height={90}
//                   priority
//                   className="h-11 w-auto"
//                 />
//               </Link>
//               <button
//                 type="button"
//                 onClick={onClose}
//                 aria-label="Close menu"
//                 className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#e0a56b]/40 text-[#e8b98a] transition-all duration-300 hover:rotate-90 hover:border-[#e0a56b] hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e0a56b]"
//               >
//                 <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
//               </button>
//               {/* Copper-to-green hairline under the header */}
//               <span
//                 aria-hidden="true"
//                 className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-[#e0a56b]/70 via-[#6fbf82]/30 to-transparent"
//               />
//             </div>

//             {/* Navigation */}
//             <nav
//               aria-label="Mobile primary"
//               className="relative flex-1 overflow-y-auto px-4 py-4"
//             >
//               <ul className="flex flex-col">
//                 {primaryNav.map((item, index) => {
//                   const children = item.children;
//                   const hasChildren = !!children && children.length > 0;
//                   const isExpanded = expandedHref === item.href;
//                   const Icon = getNavIcon(item.label, item.href);
//                   const active =
//                     isActive(pathname, item.href) ||
//                     (hasChildren &&
//                       children!.some((c) => isActive(pathname, c.href)));

//                   const rowClass = cn(
//                     "group relative flex min-h-[58px] w-full cursor-pointer items-center gap-4 rounded-xl px-4 text-left transition-colors duration-300",
//                     "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e0a56b]",
//                     active
//                       ? "bg-gradient-to-r from-green-deep/60 via-green-deep/20 to-transparent"
//                       : "hover:bg-white/[0.04] active:bg-white/[0.07]",
//                   );

//                   const iconClass = cn(
//                     "h-5 w-5 shrink-0 transition-colors duration-300",
//                     active
//                       ? "text-[#f0c391]"
//                       : "text-[#8fd19e]/80 group-hover:text-[#b8f0c4]",
//                   );

//                   const labelClass = cn(
//                     "flex-1 font-display text-[21px] leading-none tracking-[0.005em] transition-colors duration-300",
//                     active
//                       ? "text-cream"
//                       : "text-cream/75 group-hover:text-cream",
//                   );

//                   return (
//                     <motion.li
//                       key={item.href}
//                       initial={reduceMotion ? false : { opacity: 0, x: 18 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{
//                         duration: 0.45,
//                         delay: reduceMotion ? 0 : 0.14 + index * 0.05,
//                         ease: [0.22, 1, 0.36, 1],
//                       }}
//                       className="border-b border-[#e0a56b]/10 last:border-b-0"
//                     >
//                       {hasChildren ? (
//                         <>
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setExpandedHref(isExpanded ? null : item.href)
//                             }
//                             aria-expanded={isExpanded}
//                             className={rowClass}
//                           >
//                             {active && <ActiveRule />}
//                             <Icon className={iconClass} strokeWidth={1.4} />
//                             <span className={labelClass}>{item.label}</span>
//                             <ChevronDown
//                               className={cn(
//                                 "h-4 w-4 text-[#e0a56b] transition-transform duration-300",
//                                 isExpanded && "rotate-180",
//                               )}
//                               strokeWidth={1.5}
//                             />
//                           </button>

//                           <AnimatePresence initial={false}>
//                             {isExpanded && (
//                               <motion.ul
//                                 initial={{ height: 0, opacity: 0 }}
//                                 animate={{ height: "auto", opacity: 1 }}
//                                 exit={{ height: 0, opacity: 0 }}
//                                 transition={{ duration: 0.28, ease: "easeOut" }}
//                                 className="ml-[26px] overflow-hidden border-l border-[#6fbf82]/25 pb-2 pl-5"
//                               >
//                                 {children!.map((child) => {
//                                   const childActive = isActive(pathname, child.href);
//                                   return (
//                                     <li key={child.href}>
//                                       <Link
//                                         href={child.href}
//                                         onClick={onClose}
//                                         aria-current={childActive ? "page" : undefined}
//                                         className={cn(
//                                           "group/child flex min-h-[44px] items-center gap-3 rounded-lg px-3 font-sans text-[15px] transition-colors",
//                                           "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e0a56b]",
//                                           childActive
//                                             ? "font-medium text-[#f0c391]"
//                                             : "text-cream/65 hover:text-cream",
//                                         )}
//                                       >
//                                         <span
//                                           aria-hidden="true"
//                                           className={cn(
//                                             "h-[5px] w-[5px] shrink-0 rotate-45 transition-colors",
//                                             childActive
//                                               ? "bg-[#f0c391]"
//                                               : "bg-[#6fbf82]/60 group-hover/child:bg-[#9be0ac]",
//                                           )}
//                                         />
//                                         {child.label}
//                                       </Link>
//                                     </li>
//                                   );
//                                 })}
//                               </motion.ul>
//                             )}
//                           </AnimatePresence>
//                         </>
//                       ) : (
//                         <Link
//                           href={item.href}
//                           onClick={onClose}
//                           aria-current={
//                             isActive(pathname, item.href) ? "page" : undefined
//                           }
//                           className={rowClass}
//                         >
//                           {active && <ActiveRule />}
//                           <Icon className={iconClass} strokeWidth={1.4} />
//                           <span className={labelClass}>{item.label}</span>
//                         </Link>
//                       )}
//                     </motion.li>
//                   );
//                 })}
//               </ul>
//             </nav>

//             {/* Footer */}
//             <div className="relative px-6 pb-6 pt-4">
//               <span
//                 aria-hidden="true"
//                 className="absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-[#e0a56b]/50 to-transparent"
//               />
//               {onOpenAuth && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     onClose();
//                     onOpenAuth();
//                   }}
//                   className="flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-[#ecc397] via-[#d79a5b] to-[#b87333] font-sans text-[15px] font-semibold tracking-wide text-[#24150e] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_24px_-10px_rgba(184,115,51,0.8)] transition-[filter,transform] duration-300 hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c391] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f120b]"
//                 >
//                   <User className="h-[18px] w-[18px]" strokeWidth={1.8} />
//                   Sign in
//                 </button>
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }

// /** Copper rule on the left edge of the active row */
// function ActiveRule() {
//   return (
//     <span
//       aria-hidden="true"
//       className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-[#f0c391] to-[#b87333]"
//     />
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BookOpen,
  ChevronDown,
  Coffee,
  Home,
  Info,
  Leaf,
  Mail,
  Package,
  ShoppingBag,
  Sparkles,
  Store,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { primaryNav } from "@/data/site";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Icon lookup: matches keywords in the nav label/href, so `primaryNav`
 * doesn't need to change. First match wins; Leaf is the fallback.
 */
const ICON_RULES: [RegExp, LucideIcon][] = [
  [/^\s*home|^\s*\/\s*$/, Home],
  [/about|story|our-?brand/, Info],
  [/tea|coffee|brew|blend|flovera|blue-?moon/, Coffee],
  [/product|collection|range|catalog/, Package],
  [/shop|store|buy|order/, ShoppingBag],
  [/market|distribut|partner|wholesale|b2b|export/, Store],
  [/affiliate|team|community|people/, Users],
  [/blog|journal|news|article|learn/, BookOpen],
  [/contact|support|reach|mail/, Mail],
  [/offer|new|special|launch/, Sparkles],
];

function getNavIcon(label: string, href: string): LucideIcon {
  const key = `${label} ${href}`.toLowerCase();
  for (const [pattern, Icon] of ICON_RULES) {
    if (pattern.test(key)) return Icon;
  }
  return Leaf;
}

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0].split("#")[0];
  return path === "/"
    ? pathname === "/"
    : pathname === path || pathname.startsWith(path + "/");
}

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
  const reduce = useReducedMotion();

  // Collapse any open submenu when the sidebar closes
  useEffect(() => {
    if (!open) setExpandedHref(null);
  }, [open]);

  // Lock page scroll + close on Escape while the sidebar is open
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-[#0a1a0b]/70 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sidebar: same green gradient, dots, blobs and shine as Vision / Quality */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-y-0 right-0 z-50 flex h-[100dvh] w-[88%] max-w-[380px] flex-col overflow-hidden border-l border-copper/30 bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] text-white shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.7)] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            {/* animated blobs */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-copper/35 blur-[80px]"
              animate={reduce ? undefined : { x: [0, -24, 0], y: [0, 18, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-emerald-300/15 blur-[80px]"
              animate={reduce ? undefined : { x: [0, 20, 0], y: [0, -16, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* dots */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]"
            />
            {/* slow shine sweep (runs by itself, no hover needed on touch) */}
            {!reduce && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
                initial={{ left: "-40%" }}
                animate={{ left: "140%" }}
                transition={{
                  duration: 2.2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 5,
                  delay: 0.8,
                }}
              />
            )}
            {/* decorative leaf */}
            <Leaf
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-6 -right-6 h-48 w-48 rotate-[-20deg] text-white/[0.06]"
              strokeWidth={1}
            />

            {/* Header */}
            <div className="relative flex items-center justify-between px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
              <Link
                href="/"
                onClick={onClose}
                className="flex shrink-0 items-center"
                aria-label="Finasto home"
              >
                {/* Sidebar is always dark, so use the dark-mode logo only */}
                <Image
                  src="/brand/finasto-logo-dark.png"
                  alt="Finasto"
                  width={120}
                  height={90}
                  priority
                  className="h-11 w-auto"
                />
              </Link>
              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                whileTap={reduce ? undefined : { scale: 0.88, rotate: 90 }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-copper/50 bg-white/5 text-copper-light transition-colors active:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-light"
              >
                <X className="h-5 w-5" strokeWidth={1.6} />
              </motion.button>
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-copper-light/70 via-copper/30 to-transparent"
              />
            </div>

            {/* Navigation */}
            <nav
              aria-label="Mobile primary"
              className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <ul className="flex flex-col gap-2.5">
                {primaryNav.map((item, index) => {
                  const children = item.children;
                  const hasChildren = !!children && children.length > 0;
                  const isExpanded = expandedHref === item.href;
                  const Icon = getNavIcon(item.label, item.href);
                  const active =
                    isActive(pathname, item.href) ||
                    (hasChildren &&
                      children!.some((c) => isActive(pathname, c.href)));

                  const cardClass = cn(
                    "relative overflow-hidden rounded-2xl border transition-colors duration-300",
                    active
                      ? "border-copper/60 bg-gradient-to-r from-copper/25 via-white/10 to-transparent shadow-[0_12px_30px_-16px_rgba(0,0,0,0.7)]"
                      : "border-copper/20 bg-white/5 active:bg-white/10 md:hover:border-copper/50 md:hover:bg-white/10",
                  );

                  const rowClass =
                    "flex min-h-[60px] w-full items-center gap-4 px-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-copper-light";

                  const iconBadge = (
                    <span
                      className={cn(
                        "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]",
                        active
                          ? "bg-gradient-to-br from-cream to-copper-light"
                          : "bg-gradient-to-br from-cream/90 to-copper-light/60",
                      )}
                    >
                      <Icon
                        className="h-5 w-5 text-green-deep"
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                    </span>
                  );

                  const label = (
                    <span
                      className={cn(
                        "flex-1 font-display text-[20px] leading-tight transition-colors duration-300",
                        active ? "text-white" : "text-white/80",
                      )}
                    >
                      {item.label}
                    </span>
                  );

                  return (
                    <motion.li
                      key={item.href}
                      initial={reduce ? false : { opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: reduce ? 0 : 0.15 + index * 0.06,
                        ease: EASE,
                      }}
                    >
                      <motion.div
                        whileTap={reduce ? undefined : { scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className={cardClass}
                      >
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedHref(isExpanded ? null : item.href)
                            }
                            aria-expanded={isExpanded}
                            className={rowClass}
                          >
                            {iconBadge}
                            {label}
                            <ChevronDown
                              className={cn(
                                "h-5 w-5 text-copper-light transition-transform duration-300",
                                isExpanded && "rotate-180",
                              )}
                              strokeWidth={1.6}
                              aria-hidden="true"
                            />
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={onClose}
                            aria-current={
                              isActive(pathname, item.href) ? "page" : undefined
                            }
                            className={rowClass}
                          >
                            {iconBadge}
                            {label}
                            {active && (
                              <span
                                aria-hidden="true"
                                className="relative flex h-2.5 w-2.5"
                              >
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-copper-light opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-copper-light shadow-[0_0_8px_rgba(184,115,51,0.8)]" />
                              </span>
                            )}
                          </Link>
                        )}
                      </motion.div>

                      {/* Submenu */}
                      {hasChildren && (
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className="ml-7 overflow-hidden border-l border-copper/30 pl-4"
                            >
                              <li className="h-1.5" aria-hidden="true" />
                              {children!.map((child) => {
                                const childActive = isActive(pathname, child.href);
                                return (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      onClick={onClose}
                                      aria-current={childActive ? "page" : undefined}
                                      className={cn(
                                        "flex min-h-[46px] items-center gap-3 rounded-xl px-3 font-sans text-[15px] transition-colors active:bg-white/10",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-light",
                                        childActive
                                          ? "font-medium text-copper-light"
                                          : "text-white/70",
                                      )}
                                    >
                                      <span
                                        aria-hidden="true"
                                        className={cn(
                                          "h-[6px] w-[6px] shrink-0 rotate-45",
                                          childActive
                                            ? "bg-copper-light shadow-[0_0_8px_rgba(184,115,51,0.8)]"
                                            : "bg-copper/60",
                                        )}
                                      />
                                      {child.label}
                                    </Link>
                                  </li>
                                );
                              })}
                              <li className="h-1.5" aria-hidden="true" />
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="relative px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
              <span
                aria-hidden="true"
                className="absolute left-5 right-5 top-0 h-px bg-gradient-to-r from-transparent via-copper-light/50 to-transparent"
              />
              {onOpenAuth && (
                <motion.button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  whileTap={reduce ? undefined : { scale: 0.96 }}
                  className="relative flex min-h-[52px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-b from-[#ecc397] via-[#d79a5b] to-[#b87333] font-sans text-[15px] font-semibold tracking-wide text-[#24150e] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_24px_-10px_rgba(184,115,51,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-light focus-visible:ring-offset-2 focus-visible:ring-offset-[#10260f]"
                >
                  {!reduce && (
                    <motion.span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                      initial={{ left: "-40%" }}
                      animate={{ left: "140%" }}
                      transition={{
                        duration: 1.6,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 3.5,
                      }}
                    />
                  )}
                  <User className="relative h-[18px] w-[18px]" strokeWidth={1.8} />
                  <span className="relative">Sign in</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}