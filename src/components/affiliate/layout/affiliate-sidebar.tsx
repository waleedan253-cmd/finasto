// // "use client";

// // import Image from "next/image";
// // import Link from "next/link";
// // import { usePathname } from "next/navigation";
// // import { Leaf, LogOut, X } from "lucide-react";
// // import { cn } from "@/lib/utils";
// // import { signOutAction } from "@/lib/auth/actions";
// // import { affiliateNav, isNavActive } from "./affiliate-nav";

// // // Same structure and styling as admin-sidebar.tsx: logo on the left,
// // // nav list, sign out pinned to the bottom. onNavigate closes the mobile
// // // drawer when a link (or the close button) is tapped.

// // export function AffiliateSidebar({
// //   onNavigate,
// //   collapsed = false,
// // }: {
// //   onNavigate?: () => void;
// //   collapsed?: boolean;
// // }) {
// //   const pathname = usePathname();

// //   return (
// //     <div className="flex h-full flex-col">
// //       <div className="relative flex h-32 shrink-0 items-center justify-center border-b border-copper/25 px-5">
// //         <Link
// //           href="/affiliate"
// //           onClick={onNavigate}
// //           aria-label="Finasto affiliate home"
// //           className={cn(collapsed && "lg:hidden")}
// //         >
         
// //           <Image
// //             src="/brand/finasto-logo-dark.png"
// //             alt="Finasto"
// //             width={120}
// //             height={90}
// //             priority
// //             className="h-24 w-auto drop-shadow-[0_0_18px_rgba(201,128,63,0.35)]"
// //           />
// //         </Link>
// //         <button
// //           type="button"
// //           onClick={onNavigate}
// //           aria-label="Close menu"
// //           className="absolute right-3 top-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center text-cream/70 hover:text-cream lg:hidden"
// //         >
// //           <X className="h-5 w-5" strokeWidth={1.6} />
// //         </button>
// //       </div>

// //       <nav aria-label="Affiliate" className="flex-1 overflow-y-auto px-4 py-5">
// //         <ul className="flex flex-col gap-1.5">
// //           {affiliateNav.map(({ label, href, icon: Icon }) => {
// //             const active = isNavActive(pathname, href);
// //             return (
// //               <li key={href}>
// //                 <Link
// //                   href={href}
// //                   onClick={onNavigate}
// //                   aria-current={active ? "page" : undefined}
// //                   title={collapsed ? label : undefined}
// //                   className={cn(
// //                     "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-[14px] transition-all duration-200",
// //                     collapsed && "lg:justify-center lg:gap-0 lg:px-0",
// //                     active
// //                     ? "bg-gradient-to-r from-[#e0a35a] via-copper to-[#8a5a2a] font-medium text-cream shadow-[0_0_20px_rgba(201,128,63,0.5)] ring-1 ring-copper-light/70"
// // : "text-cream/75 hover:bg-cream/5 hover:text-cream",
// //                   )}
// //                 >
// //                   {active && (
// //                     <span
// //                       aria-hidden
// //                       className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-copper"
// //                     />
// //                   )}
// //                   <Icon
// //                     className={cn(
// //                       "h-[18px] w-[18px] shrink-0 transition-colors",
// //                     active ? "text-cream" : "group-hover:text-copper-light",
// //                     )}
// //                     strokeWidth={1.6}
// //                   />
// //                   <span className={cn("truncate", collapsed && "lg:hidden")}>
// //                     {label}
// //                   </span>
// //                 </Link>
// //               </li>
// //             );
// //           })}
// //         </ul>
// //       </nav>

// //       <div className="shrink-0 border-t border-border p-3">
// //         <form action={signOutAction}>
// //           <button
// //             type="submit"
// //             title={collapsed ? "Sign out" : undefined}
// //             className={cn(
// //               "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-[14px] text-warm-gray transition-colors hover:bg-red/10 hover:text-red",
// //               collapsed && "lg:justify-center lg:gap-0 lg:px-0",
// //             )}
// //           >
// //             <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} />
// //             <span className={cn(collapsed && "lg:hidden")}>Sign out</span>
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // }
// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { LogOut, X } from "lucide-react";
// import { motion } from "motion/react";
// import { cn } from "@/lib/utils";
// import { signOutAction } from "@/lib/auth/actions";
// import { affiliateNav, isNavActive } from "./affiliate-nav";
// import { useId } from "react";

// export function AffiliateSidebar({
//   onNavigate,
//   collapsed = false,
// }: {
//   onNavigate?: () => void;
//   collapsed?: boolean;
// }) {
//   const pathname = usePathname();
// const uid = useId().replace(/:/g, "");
//   return (
//     <div className="relative flex h-full flex-col overflow-hidden bg-[radial-gradient(ellipse_at_25%_18%,#1b4724_0%,#0c2411_48%,#051208_100%)]">
//      {/* Decorative glowing curves. The sparks are separate elements so they stay round. */}
// <div
//   aria-hidden="true"
//   className={cn(
//     "pointer-events-none absolute inset-0 z-0 transition-opacity duration-300",
//     collapsed && "lg:opacity-35",
//   )}
// >
  
// </div>

//       {/* Right vertical golden edge line */}
//       <span
//         aria-hidden="true"
//         className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[1.5px] bg-gradient-to-b from-copper/30 via-[#e5b567]/75 to-copper/30"
//       />

//       {/* Logo & Close Drawer Button */}
//       <div className="relative z-10 flex h-32 shrink-0 items-center justify-center px-5 pt-2">
//         <Link
//           href="/affiliate"
//           onClick={onNavigate}
//           aria-label="Finasto affiliate home"
//           className={cn(collapsed && "lg:hidden")}
//         >
//           <Image
//             src="/brand/finasto-logo-dark.png"
//             alt="Finasto"
//             width={130}
//             height={98}
//             priority
//             className="h-24 w-auto drop-shadow-[0_4px_20px_rgba(229,181,103,0.38)]"
//           />
//         </Link>
//         <button
//           type="button"
//           onClick={onNavigate}
//           aria-label="Close menu"
//           className="absolute right-3 top-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center text-cream/70 hover:text-cream lg:hidden"
//         >
//           <X className="h-5 w-5" strokeWidth={1.6} />
//         </button>
//       </div>

//       {/* Navigation List */}
//       <nav aria-label="Affiliate" className="relative z-10 flex-1 overflow-y-auto px-3.5 py-3">
//         <ul className="flex flex-col gap-2">
//           {affiliateNav.map(({ label, href, icon: Icon }) => {
//             const active = isNavActive(pathname, href);
//             return (
//               <li key={href}>
//                 <motion.div
//                   whileHover={{ x: 4, scale: 1.01 }}
//                   whileTap={{ scale: 0.97 }}
//                   transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
//                 >
//                   <Link
//                     href={href}
//                     onClick={onNavigate}
//                     aria-current={active ? "page" : undefined}
//                     title={collapsed ? label : undefined}
//                     className={cn(
//                       "group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 font-sans text-[14px] transition-all duration-200",
//                       collapsed && "lg:justify-center lg:gap-0 lg:px-0",
//                       active
//                         ? "bg-[linear-gradient(90deg,#fffaf0_0%,#f1cb88_22%,#b7843e_65%,rgba(122,82,34,0.38)_100%)] font-semibold text-[#0d2612] shadow-[0_0_24px_rgba(229,181,103,0.45),inset_0_1px_1px_rgba(255,255,255,0.75)] ring-1 ring-[#f4d498]/85"
//                         : "text-cream/85 hover:bg-cream/5 hover:text-cream",
//                     )}
//                   >
//                     <Icon
//                       className={cn(
//                         "h-[18px] w-[18px] shrink-0 transition-colors",
//                         active
//                           ? "text-[#0d2612]"
//                           : "text-cream/80 group-hover:text-[#f1cb88]",
//                       )}
//                       strokeWidth={active ? 2 : 1.6}
//                     />
//                     <span
//                       className={cn("truncate", collapsed && "lg:hidden")}
//                     >
//                       {label}
//                     </span>
//                   </Link>
//                 </motion.div>
//               </li>
//             );
//           })}
//         </ul>
//       </nav>

//       {/* Sign Out Section (Pinned to Bottom without Promo Card) */}
//       <div className="relative z-10 shrink-0 p-3.5 pb-5">
//         <form action={signOutAction}>
//           <motion.div
//             whileHover={{ x: 3 }}
//             whileTap={{ scale: 0.97 }}
//             transition={{ duration: 0.2, ease: "easeOut" }}
//           >
//             <button
//               type="submit"
//               title={collapsed ? "Sign out" : undefined}
//               className={cn(
//                 "flex w-full cursor-pointer items-center gap-3.5 rounded-xl px-3.5 py-2.5 font-sans text-[14px] text-cream/75 transition-colors hover:bg-red/10 hover:text-red",
//                 collapsed && "lg:justify-center lg:gap-0 lg:px-0",
//               )}
//             >
//               <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} />
//               <span className={cn(collapsed && "lg:hidden")}>Sign out</span>
//             </button>
//           </motion.div>
//         </form>
//       </div>
//     </div>
//   );
// }
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/auth/actions";
import { affiliateNav, isNavActive } from "./affiliate-nav";

// Affiliate sidebar: logo, nav list, sign out pinned to the bottom.
// onNavigate closes the mobile drawer when a link (or the close button)
// is tapped. Colors come from the aff-* tokens in globals.css.

export function AffiliateSidebar({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[radial-gradient(ellipse_at_25%_18%,var(--color-aff-green-800)_0%,var(--color-aff-green-900)_48%,var(--color-aff-green-950)_100%)]">
      {/* Right vertical golden edge line */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[1.5px] bg-gradient-to-b from-aff-gold-600/30 via-aff-gold-300/75 to-aff-gold-600/30"
      />

      {/* Logo & Close Drawer Button */}
      <div className="relative z-10 flex h-32 shrink-0 items-center justify-center px-5 pt-2">
        <Link
          href="/affiliate"
          onClick={onNavigate}
          aria-label="Finasto affiliate home"
          className={cn(collapsed && "lg:hidden")}
        >
          <Image
            src="/brand/finasto-logo-dark.png"
            alt="Finasto"
            width={130}
            height={98}
            priority
            className="h-24 w-auto drop-shadow-[0_4px_20px_rgba(241,204,156,0.35)]"
          />
        </Link>
        <button
          type="button"
          onClick={onNavigate}
          aria-label="Close menu"
          className="absolute right-3 top-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center text-aff-cream-50/70 hover:text-aff-cream-50 lg:hidden"
        >
          <X className="h-5 w-5" strokeWidth={1.6} />
        </button>
      </div>

      {/* Navigation List */}
      <nav
        aria-label="Affiliate"
        className="relative z-10 flex-1 overflow-y-auto px-3.5 py-3"
      >
        <ul className="flex flex-col gap-2">
          {affiliateNav.map(({ label, href, icon: Icon }) => {
            const active = isNavActive(pathname, href);
            return (
              <li key={href}>
                <motion.div
                  whileHover={{ x: 4, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 font-sans text-[14px] transition-all duration-200",
                      collapsed && "lg:justify-center lg:gap-0 lg:px-0",
                      active
                        ? "bg-gradient-to-r from-aff-cream-50 via-aff-gold-300 to-aff-gold-600 font-semibold text-aff-green-950 shadow-[0_0_24px_rgba(241,204,156,0.4),inset_0_1px_1px_rgba(255,255,255,0.7)] ring-1 ring-aff-gold-300/80"
                        : "text-aff-cream-50/85 hover:bg-aff-cream-50/5 hover:text-aff-cream-50",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        active
                          ? "text-aff-green-950"
                          : "text-aff-cream-50/80 group-hover:text-aff-gold-300",
                      )}
                      strokeWidth={active ? 2 : 1.6}
                    />
                    <span
                      className={cn("truncate", collapsed && "lg:hidden")}
                    >
                      {label}
                    </span>
                  </Link>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign Out Section (pinned to bottom) */}
      <div className="relative z-10 shrink-0 p-3.5 pb-5">
        <form action={signOutAction}>
          <motion.div
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <button
              type="submit"
              title={collapsed ? "Sign out" : undefined}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3.5 rounded-xl px-3.5 py-2.5 font-sans text-[14px] text-aff-cream-50/75 transition-colors hover:bg-aff-cream-50/5 hover:text-aff-gold-300",
                collapsed && "lg:justify-center lg:gap-0 lg:px-0",
              )}
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} />
              <span className={cn(collapsed && "lg:hidden")}>Sign out</span>
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}