// import Image from "next/image";
// import Link from "next/link";
// import { footerColumns, socialLinks } from "@/data/site";
// import { Flag } from "@/components/ui/flag";

// const socialIcons = {
//   instagram: InstagramIcon,
//   facebook: FacebookIcon,
//   youtube: YouTubeIcon,
//   tiktok: TikTokIcon,
// };

// export function SiteFooter() {
//   return (
//    <footer className="site-footer relative border-t-2 border-copper/60 bg-[#183321] text-cream/80 dark:bg-espresso-deep">
//       <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8">
//         <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
//           {/* Logo + market */}
//           <div className="flex flex-col gap-6">
//             <Link
//               href="/"
//               className="flex items-center  "
//               aria-label="Finasto home"
//             >
//               <Image
//                 src="/brand/finasto-logo-dark.png"
//                 alt="Finasto"
//                 width={120}
//                 height={90}
//                 className="h-12 w-auto"
//               />
//             </Link>
//            <p className="max-w-[260px] font-sans text-[14px] leading-relaxed text-cream/60">
//               Premium Bali coffee and tea, grown with care and shared with the world.
//             </p>
//           </div>


//           {/* Link columns */}
//           <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:gap-x-24">
//             {footerColumns.map((column) => (
//               <div key={column.title} className={column.title === "About Finasto" ? "lg:ml-12" : ""}>
//                 <h3 className="font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-copper-light">
//                   {column.title}
//                 </h3>
//                 <ul className="mt-4 flex flex-col gap-3">
//                   {column.links.map((link) => (
//                     <li key={link.href}>
//                       <Link
//                         href={link.href}
//                         className="font-sans text-[14px] text-cream/70 transition-colors hover:text-copper-light focus-visible:text-copper-light focus-visible:outline-none"
//                       >
//                         {link.label}
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </nav>

//           {/* Social */}
//           <div>
//             <h3 className="font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-copper-light">
//               Follow Us
//             </h3>
//             <div className="mt-4 flex items-center gap-3">
//               {socialLinks.map((social) => {
//                 const Icon = socialIcons[social.icon];
//                 return (
//                   <a
//                     key={social.icon}
//                     href={social.href}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     aria-label={social.label}
//                     className="flex h-9 w-9 items-center justify-center rounded-full border border-copper-light/30 text-cream/70 transition-all hover:-translate-y-0.5 hover:border-copper-light hover:bg-copper-light/10 hover:text-copper-light"
//                   >
//                     <Icon className="h-4 w-4" />
//                   </a>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
//           <p className="font-sans text-[12px] text-cream/60">
//             © {new Date().getFullYear()} Finasto. All rights reserved.
//           </p>
//           <div className="flex gap-5">
//             <Link
//               href="/privacy-policy"
//               className="font-sans text-[12px] text-cream/50 hover:text-cream/80"
//             >
//               Privacy Policy
//             </Link>
//             <Link
//               href="/terms"
//               className="font-sans text-[12px] text-cream/50 hover:text-cream/80"
//             >
//               Terms of Service
//             </Link>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

// // lucide-react no longer ships brand/social icons — minimal outline
// // glyphs here match its 1.6 stroke weight so the row looks consistent.
// function InstagramIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth={1.6}
//       className={className}
//       aria-hidden="true"
//     >
//       <rect x="3" y="3" width="18" height="18" rx="5" />
//       <circle cx="12" cy="12" r="4" />
//       <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
//     </svg>
//   );
// }

// function FacebookIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth={1.6}
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className={className}
//       aria-hidden="true"
//     >
//       <path d="M15 8.5h-2c-.8 0-1.5.7-1.5 1.5v2h3.4l-.4 3H11.5v7h-3v-7H6.5v-3H8.5V10a4 4 0 0 1 4-4H15v2.5z" />
//     </svg>
//   );
// }

// function YouTubeIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth={1.6}
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className={className}
//       aria-hidden="true"
//     >
//       <rect x="2.5" y="6" width="19" height="12" rx="4" />
//       <path d="M10.5 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
//     </svg>
//   );
// }

// // TikTok has no dedicated lucide icon; a minimal outline glyph keeps the
// // same 16px/1.6 stroke look as the rest of the social row.
// function TikTokIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth={1.6}
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className={className}
//       aria-hidden="true"
//     >
//       <path d="M16 3c.5 2.5 2.2 4.2 4.7 4.5v3.1c-1.7 0-3.3-.5-4.7-1.5v6.4a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.2a2.5 2.5 0 1 0 1.8 2.4V3h3z" />
//     </svg>
//   );
// }

import Image from "next/image";
import Link from "next/link";
import { footerColumns, socialLinks } from "@/data/site";
import { withTM } from "@/lib/brand";

const socialIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
};

/**
 * Footer with the folk-art panorama as its background.
 * - Desktop: the artwork fills the footer; the content block starts lower down
 *   so the illustrations stay clear at the top, then a cream veil fades in
 *   behind the text for contrast.
 * - Mobile: the artwork is a fixed-height band at the top that fades into
 *   cream, so tall stacked columns never sit on a stretched image.
 * - Dark mode: the veil and text switch to espresso/cream.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer relative isolate overflow-hidden border-t-2 border-copper/60 bg-cream text-espresso/80 dark:bg-espresso-deep dark:text-cream/80">
      {/* Background art + contrast veil */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[340px] sm:inset-0 sm:h-auto"
      >
        <Image
          src="/brand/Bali and India Travel Carnival Collage.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center sm:object-top dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-20% via-cream/90 via-55% to-cream dark:via-espresso-deep/90 dark:to-espresso-deep" />
      </div>

      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-52 sm:px-8 sm:pt-60 lg:pt-72">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          {/* Logo + tagline */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center" aria-label="Finasto home">
              {/* Light-theme logo for the cream background. Update the filename if yours differs. */}
              <Image
                src="/brand/finasto-logo.png"
                alt="Finasto"
                width={120}
                height={90}
                className="h-16 w-auto dark:hidden"
              />
              <Image
                src="/brand/finasto-logo-dark.png"
                alt="Finasto"
                width={120}
                height={90}
                className="hidden h-16 w-auto dark:block"
              />
            </Link>
            <p className="max-w-[260px] font-sans text-[14px] leading-relaxed text-espresso/70 dark:text-cream/60">
              Premium  coffee and tea, grown with care and shared with the world.
            </p>
          </div>

          {/* Link columns */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:gap-x-24"
          >
            {footerColumns.map((column) => (
              <div
                key={column.title}
                className={column.title === "About Finasto™" ? "lg:ml-12" : ""}
              >
                <h3 className="font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-copper dark:text-copper-light">
                  {withTM(column.title)}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="font-sans text-[14px] text-espresso/80 transition-colors hover:text-copper focus-visible:text-copper focus-visible:outline-none dark:text-cream/70 dark:hover:text-copper-light dark:focus-visible:text-copper-light"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Social */}
          <div>
            <h3 className="font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-copper dark:text-copper-light">
              Follow Us
            </h3>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = socialIcons[social.icon];
                return (
                  <a
                    key={social.icon}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-copper/50 bg-cream/60 text-green-deep transition-all hover:-translate-y-0.5 hover:border-copper hover:bg-copper/10 hover:text-copper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper dark:border-copper-light/30 dark:bg-transparent dark:text-cream/70 dark:hover:border-copper-light dark:hover:bg-copper-light/10 dark:hover:text-copper-light"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-copper/30 pt-6 sm:flex-row dark:border-white/10">
          <p className="font-sans text-[12px] text-espresso/70 dark:text-cream/60">
            © {new Date().getFullYear()} Finasto. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link
              href="/privacy-policy"
              className="font-sans text-[12px] text-espresso/70 hover:text-copper dark:text-cream/50 dark:hover:text-cream/80"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-sans text-[12px] text-espresso/70 hover:text-copper dark:text-cream/50 dark:hover:text-cream/80"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// lucide-react no longer ships brand/social icons — minimal outline
// glyphs here match its 1.6 stroke weight so the row looks consistent.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 8.5h-2c-.8 0-1.5.7-1.5 1.5v2h3.4l-.4 3H11.5v7h-3v-7H6.5v-3H8.5V10a4 4 0 0 1 4-4H15v2.5z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="6" width="19" height="12" rx="4" />
      <path d="M10.5 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

// TikTok has no dedicated lucide icon; a minimal outline glyph keeps the
// same 16px/1.6 stroke look as the rest of the social row.
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 3c.5 2.5 2.2 4.2 4.7 4.5v3.1c-1.7 0-3.3-.5-4.7-1.5v6.4a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.2a2.5 2.5 0 1 0 1.8 2.4V3h3z" />
    </svg>
  );
}