// // "use client";

// // import {
// //   createContext,
// //   useCallback,
// //   useContext,
// //   useEffect,
// //   useMemo,
// //   useState,
// //   type ReactNode,
// // } from "react";
// // import Image from "next/image";
// // import { Link, Loader2 } from "lucide-react";

// // type Ctx = { show: () => void; hide: () => void };
// // const AuthLoadingContext = createContext<Ctx>({ show() {}, hide() {} });

// // export const useAuthLoading = () => useContext(AuthLoadingContext);

// // export function AuthLoadingProvider({ children }: { children: ReactNode }) {
// //   const [visible, setVisible] = useState(false);
// //   const show = useCallback(() => setVisible(true), []);
// //   const hide = useCallback(() => setVisible(false), []);
// //   const value = useMemo(() => ({ show, hide }), [show, hide]);

// //   // Lock scroll while visible; safety net hides it after 20s so it can never get stuck.
// //   useEffect(() => {
// //     if (!visible) return;
// //     const prev = document.body.style.overflow;
// //     document.body.style.overflow = "hidden";
// //     const t = setTimeout(() => setVisible(false), 20000);
// //     return () => {
// //       document.body.style.overflow = prev;
// //       clearTimeout(t);
// //     };
// //   }, [visible]);

// //   return (
// //     <AuthLoadingContext.Provider value={value}>
// //       {children}
// //       {visible && (
// //         <div
// //           role="status"
// //           aria-live="polite"
// //           aria-busy="true"
// //           className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-cream px-6 text-center"
// //         >
          
// //                      <Image
// //                        src="/brand/finasto-logo.png"
// //                        alt="Finasto"
// //                        width={120}
// //                        height={90}
// //                        priority
// //                        className="h-11 w-auto dark:hidden"
// //                      />
// //                      <Image
// //                        src="/brand/finasto-logo-dark.png"
// //                        alt="Finasto"
// //                        width={120}
// //                        height={90}
// //                        priority
// //                        className="hidden h-11 w-auto dark:block"
// //                      />
                
// //           <Loader2
// //             className="h-10 w-10 animate-spin text-copper"
// //             strokeWidth={1.5}
// //             aria-hidden="true"
// //           />
// //           <p className="font-display text-[26px] text-green-deep">
// //            Verifying your access…
// //           </p>
       
// //         </div>
// //       )}
// //     </AuthLoadingContext.Provider>
// //   );
// // }

// // /** Put this inside each dashboard page. It hides the overlay once the page has really rendered. */
// // export function AuthOverlayDismiss() {
// //   const { hide } = useAuthLoading();
// //   useEffect(() => {
// //     hide();
// //   }, [hide]);
// //   return null;
// // }

// "use client";

// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   type ReactNode,
// } from "react";
// import Image from "next/image";
// import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// type Ctx = { show: () => void; hide: () => void };
// const AuthLoadingContext = createContext<Ctx>({ show() {}, hide() {} });

// export const useAuthLoading = () => useContext(AuthLoadingContext);

// const EASE = [0.22, 1, 0.36, 1] as const;
// const GOLD_LIGHT = "#fbe7a6";
// const GOLD = "#e8c06a";
// const GOLD_DEEP = "#b8862b";

// const MESSAGES = [
//   { at: 0, text: "Verifying your access…" },
//   { at: 35, text: "Securing your session…" },
//   { at: 70, text: "Almost ready to go…" },
// ];

// export function AuthLoadingProvider({ children }: { children: ReactNode }) {
//   const [visible, setVisible] = useState(false);
//   const show = useCallback(() => setVisible(true), []);
//   const hide = useCallback(() => setVisible(false), []);
//   const value = useMemo(() => ({ show, hide }), [show, hide]);

//   // Lock scroll while visible; safety net hides it after 20s so it can never get stuck.
//   useEffect(() => {
//     if (!visible) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     const t = setTimeout(() => setVisible(false), 20000);
//     return () => {
//       document.body.style.overflow = prev;
//       clearTimeout(t);
//     };
//   }, [visible]);

//   return (
//     <AuthLoadingContext.Provider value={value}>
//       {children}
//       <AnimatePresence>{visible && <LoadingScreen />}</AnimatePresence>
//     </AuthLoadingContext.Provider>
//   );
// }

// function LoadingScreen() {
//   const reduce = useReducedMotion();
//   const [progress, setProgress] = useState(0);

//   // Simulated progress: moves fast at first, slows down, and never reaches 100
//   // (the screen disappears when the dashboard is really ready).
//   useEffect(() => {
//     const id = setInterval(() => {
//       setProgress((p) => Math.min(94, p + Math.max(0.35, (94 - p) * 0.045)));
//     }, 100);
//     return () => clearInterval(id);
//   }, []);

//   const message =
//     [...MESSAGES].reverse().find((m) => progress >= m.at) ?? MESSAGES[0];
//   const percent = Math.round(progress);

//   return (
//     <motion.div
//       role="status"
//       aria-live="polite"
//       aria-busy="true"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.35, ease: EASE }}
//       className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-cream px-6 text-center"
//     >
//       {/* Soft golden glow behind the logo */}
//       <motion.div
//         aria-hidden="true"
//         className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
//         style={{
//           background: `radial-gradient(circle, ${GOLD}38 0%, ${GOLD}14 40%, transparent 70%)`,
//         }}
//         animate={reduce ? undefined : { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
//         transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
//       />

//       <motion.div
//         initial={{ opacity: 0, y: 16, scale: 0.96 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.6, ease: EASE }}
//         className="relative flex flex-col items-center"
//       >
//         {/* Logo inside a circle that fills up as it loads */}
//         <div className="relative grid h-[140px] w-[140px] place-items-center">
//           <svg
//             viewBox="0 0 140 140"
//             className="absolute inset-0 h-full w-full -rotate-90"
//             aria-hidden="true"
//           >
//             <defs>
//               <linearGradient id="auth-load-ring" x1="0" y1="0" x2="1" y2="1">
//                 <stop offset="0%" stopColor={GOLD_LIGHT} />
//                 <stop offset="55%" stopColor={GOLD} />
//                 <stop offset="100%" stopColor={GOLD_DEEP} />
//               </linearGradient>
//             </defs>
//             {/* Track */}
//             <circle
//               cx="70"
//               cy="70"
//               r="64"
//               fill="none"
//               stroke={GOLD}
//               strokeOpacity="0.22"
//               strokeWidth="4"
//             />
//             {/* Filling progress arc */}
//             <motion.circle
//               cx="70"
//               cy="70"
//               r="64"
//               fill="none"
//               stroke="url(#auth-load-ring)"
//               strokeWidth="4"
//               strokeLinecap="round"
//               initial={{ pathLength: 0 }}
//               animate={{ pathLength: Math.max(0.02, progress / 100) }}
//               transition={{ duration: 0.25, ease: "linear" }}
//             />
//           </svg>

//           {/* Spinning highlight so the circle always looks alive */}
//           {!reduce && (
//             <motion.svg
//               viewBox="0 0 140 140"
//               className="absolute inset-0 h-full w-full"
//               aria-hidden="true"
//               animate={{ rotate: 360 }}
//               transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
//             >
//               <circle
//                 cx="70"
//                 cy="70"
//                 r="64"
//                 fill="none"
//                 stroke={GOLD_LIGHT}
//                 strokeWidth="4"
//                 strokeLinecap="round"
//                 strokeDasharray="14 390"
//                 opacity="0.9"
//               />
//             </motion.svg>
//           )}

//           <motion.div
//             animate={reduce ? undefined : { scale: [1, 1.04, 1] }}
//             transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
//           >
//             <Image
//               src="/brand/finasto-logo.png"
//               alt="Finasto"
//               width={120}
//               height={90}
//               priority
//               className="h-[58px] w-auto dark:hidden"
//             />
//             <Image
//               src="/brand/finasto-logo-dark.png"
//               alt="Finasto"
//               width={120}
//               height={90}
//               priority
//               className="hidden h-[58px] w-auto dark:block"
//             />
//           </motion.div>
//         </div>

//         {/* Status message (changes as progress moves) */}
//         <div className="mt-8 h-[36px]">
//           <AnimatePresence mode="wait" initial={false}>
//             <motion.p
//               key={message.text}
//               initial={{ opacity: 0, y: 8 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -8 }}
//               transition={{ duration: 0.3, ease: EASE }}
//               className="font-display text-[26px] leading-tight text-green-deep"
//             >
//               {message.text}
//             </motion.p>
//           </AnimatePresence>
//         </div>

//         <p className="mt-1 font-sans text-[14px] tabular-nums text-espresso/60">
//           Loading… {percent}%
//         </p>

//         {/* Progress bar that fills with the same value as the circle */}
//         <div className="relative mt-6 h-[6px] w-60 overflow-hidden rounded-full bg-espresso/10">
//           <motion.div
//             className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-[#f6d77e] via-[#e8c06a] to-[#b8862b]"
//             initial={{ width: "2%" }}
//             animate={{ width: `${Math.max(2, progress)}%` }}
//             transition={{ duration: 0.25, ease: "linear" }}
//           >
//             {!reduce && (
//               <motion.span
//                 aria-hidden="true"
//                 className="absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
//                 initial={{ left: "-40%" }}
//                 animate={{ left: "140%" }}
//                 transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
//               />
//             )}
//           </motion.div>
//         </div>

//         <p className="mt-6 flex items-center gap-1.5 font-sans text-[12px] tracking-wide text-espresso/45">
//           <svg
//             viewBox="0 0 24 24"
//             className="h-3.5 w-3.5"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="1.8"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             aria-hidden="true"
//           >
//             <rect x="5" y="11" width="14" height="9" rx="2" />
//             <path d="M8 11V8a4 4 0 0 1 8 0v3" />
//           </svg>
//           Secure sign-in
//         </p>
//       </motion.div>
//     </motion.div>
//   );
// }

// /** Put this inside each dashboard page. It hides the overlay once the page has really rendered. */
// export function AuthOverlayDismiss() {
//   const { hide } = useAuthLoading();
//   useEffect(() => {
//     hide();
//   }, [hide]);
//   return null;
// }\\


"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type Ctx = { show: () => void; hide: () => void };
const AuthLoadingContext = createContext<Ctx>({ show() {}, hide() {} });

export const useAuthLoading = () => useContext(AuthLoadingContext);

const EASE = [0.22, 1, 0.36, 1] as const;
const GOLD_LIGHT = "#fbe7a6";
const GOLD = "#e8c06a";
const GOLD_DEEP = "#b8862b";

const MESSAGES = [
  { at: 0, text: "Verifying your access…" },
  { at: 35, text: "Securing your session…" },
  { at: 70, text: "Almost ready to go…" },
];
const DONE_MESSAGE = "Opening your dashboard…";

export function AuthLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const startPath = useRef<string | null>(null);

  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  const show = useCallback(() => {
    startPath.current = pathRef.current; // remember where the login happened
    setDone(false);
    setVisible(true);
  }, []);
  const hide = useCallback(() => {
    setVisible(false);
    setDone(false);
  }, []);
  const value = useMemo(() => ({ show, hide }), [show, hide]);

  // As soon as the app navigates to a different page (the dashboard), finish the
  // progress to 100% and reveal the page. This works even if a dashboard page
  // forgot to render <AuthOverlayDismiss />.
  useEffect(() => {
    if (!visible || startPath.current === null) return;
    if (pathname === startPath.current) return;
    setDone(true);
    const t = setTimeout(() => {
      setVisible(false);
      setDone(false);
    }, 600);
    return () => clearTimeout(t);
  }, [pathname, visible]);

  // Lock scroll while visible; safety net hides it after 20s so it can never get stuck.
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      setVisible(false);
      setDone(false);
    }, 20000);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [visible]);

  return (
    <AuthLoadingContext.Provider value={value}>
      {children}
      <AnimatePresence>{visible && <LoadingScreen done={done} />}</AnimatePresence>
    </AuthLoadingContext.Provider>
  );
}

function LoadingScreen({ done }: { done: boolean }) {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);

  // Simulated progress: moves fast at first, slows down, and holds at 94%
  // until the dashboard is really ready, then jumps to 100%.
  useEffect(() => {
    if (done) {
      setProgress(100);
      return;
    }
    const id = setInterval(() => {
      setProgress((p) => Math.min(94, p + Math.max(0.35, (94 - p) * 0.045)));
    }, 100);
    return () => clearInterval(id);
  }, [done]);

  const messageText = done
    ? DONE_MESSAGE
    : ([...MESSAGES].reverse().find((m) => progress >= m.at) ?? MESSAGES[0]).text;
  const percent = Math.round(progress);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-busy="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-cream px-6 text-center"
    >
      {/* Soft golden glow behind the logo */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${GOLD}38 0%, ${GOLD}14 40%, transparent 70%)`,
        }}
        animate={reduce ? undefined : { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative flex flex-col items-center"
      >
        {/* Logo inside a circle that fills up as it loads */}
        <div className="relative grid h-[140px] w-[140px] place-items-center">
          <svg
            viewBox="0 0 140 140"
            className="absolute inset-0 h-full w-full -rotate-90"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="auth-load-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={GOLD_LIGHT} />
                <stop offset="55%" stopColor={GOLD} />
                <stop offset="100%" stopColor={GOLD_DEEP} />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx="70"
              cy="70"
              r="64"
              fill="none"
              stroke={GOLD}
              strokeOpacity="0.22"
              strokeWidth="4"
            />
            {/* Filling progress arc */}
            <motion.circle
              cx="70"
              cy="70"
              r="64"
              fill="none"
              stroke="url(#auth-load-ring)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: Math.max(0.02, progress / 100) }}
              transition={{ duration: done ? 0.4 : 0.25, ease: "linear" }}
            />
          </svg>

          {/* Spinning highlight so the circle always looks alive */}
          {!reduce && !done && (
            <motion.svg
              viewBox="0 0 140 140"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            >
              <circle
                cx="70"
                cy="70"
                r="64"
                fill="none"
                stroke={GOLD_LIGHT}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="14 390"
                opacity="0.9"
              />
            </motion.svg>
          )}

          <motion.div
            animate={reduce ? undefined : { scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/brand/finasto-logo.png"
              alt="Finasto"
              width={120}
              height={90}
              priority
              className="h-[58px] w-auto dark:hidden"
            />
            <Image
              src="/brand/finasto-logo-dark.png"
              alt="Finasto"
              width={120}
              height={90}
              priority
              className="hidden h-[58px] w-auto dark:block"
            />
          </motion.div>
        </div>

        {/* Status message (changes as progress moves) */}
        <div className="mt-8 h-[36px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={messageText}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="font-display text-[26px] leading-tight text-green-deep"
            >
              {messageText}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="mt-1 font-sans text-[14px] tabular-nums text-espresso/60">
          Loading… {percent}%
        </p>

        {/* Progress bar that fills with the same value as the circle */}
        <div className="relative mt-6 h-[6px] w-60 overflow-hidden rounded-full bg-espresso/10">
          <motion.div
            className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-[#f6d77e] via-[#e8c06a] to-[#b8862b]"
            initial={{ width: "2%" }}
            animate={{ width: `${Math.max(2, progress)}%` }}
            transition={{ duration: done ? 0.4 : 0.25, ease: "linear" }}
          >
            {!reduce && !done && (
              <motion.span
                aria-hidden="true"
                className="absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                initial={{ left: "-40%" }}
                animate={{ left: "140%" }}
                transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
              />
            )}
          </motion.div>
        </div>

        <p className="mt-6 flex items-center gap-1.5 font-sans text-[12px] tracking-wide text-espresso/45">
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          Secure sign-in
        </p>
      </motion.div>
    </motion.div>
  );
}

/** Optional: still safe to put inside dashboard pages. It hides the overlay once the page has rendered. */
export function AuthOverlayDismiss() {
  const { hide } = useAuthLoading();
  useEffect(() => {
    hide();
  }, [hide]);
  return null;
} 