
import Image from "next/image";
import Link from "next/link";
import { footerColumns, socialLinks } from "@/data/site";
import { withTM } from "@/lib/brand";
import { FooterLink, SocialLink } from "@/components/layout/footer-links";
import { FooterHeadingLine } from "@/components/layout/footer-heading-line";
import { motion } from "motion/react";

const socialIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
   
  whatsapp: WhatsAppIcon,

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
const columnLinkClass =
  "font-sans text-[14px] text-espresso/80 transition-colors focus-visible:text-copper focus-visible:outline-none data-[active=true]:text-copper dark:text-cream/70 dark:focus-visible:text-copper-light dark:data-[active=true]:text-copper-light";

const socialClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-copper/50 bg-cream/60 text-green-deep transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper data-[active=true]:-translate-y-0.5 data-[active=true]:border-copper data-[active=true]:bg-copper/10 data-[active=true]:text-copper dark:border-copper-light/30 dark:bg-transparent dark:text-cream/70 dark:data-[active=true]:border-copper-light dark:data-[active=true]:bg-copper-light/10 dark:data-[active=true]:text-copper-light";

const legalLinkClass =
  "font-sans text-[12px] text-espresso/70 transition-colors data-[active=true]:text-copper dark:text-cream/50 dark:data-[active=true]:text-cream/80";
export function SiteFooter() {
  return (
    <footer className="site-footer relative isolate overflow-hidden border-t-2 border-copper/60  text-espresso/80 ">
      
      {/* Background art + contrast veil */}
           <div aria-hidden="true" className="relative w-full ">
            
        <Image
          src="/brand/Bali and India Travel Carnival Collage.png"
          alt=""
          width={600}
          height={600}
          sizes="100vw"
          className="h-auto max-h-[220px] w-full object-cover object-center sm:max-h-[260px] dark:opacity-40"
        />
        {/* <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-cream dark:to-espresso-deep" /> */}
      </div>

      <div className="mx-auto max-w-[1440px] px-5 pb-6 pt-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
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
              Finasto™ Elevating Global Standards in Premium Tea and Coffee with Excellence.
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
                <h3 className="font-sans text-[13px]  font-bold uppercase tracking-[0.1em] text-green dark:text-copper-light">
                  {withTM(column.title)}
                </h3>
                <FooterHeadingLine />
                
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                     <FooterLink href={link.href} className={columnLinkClass}>
  {link.label}
</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Follow Us: mobile only, fills the empty cell beside the last column */}
            <div className="sm:hidden">
              <h3 className="font-sans text-[13px] font-bold uppercase tracking-[0.1em] text-green dark:text-copper-light">
                Follow Us
              </h3>
              <FooterHeadingLine />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = socialIcons[social.icon];
                  return (
                   <SocialLink
  key={social.icon}
  href={social.href}
  label={social.label}
  className={socialClass}
>
  <Icon className="h-4 w-4" />
</SocialLink>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Social (desktop/tablet) */}
          <div className="hidden sm:block">
            <h3 className="font-sans text-[13px] font-bold  uppercase tracking-[0.1em] text-green dark:text-copper-light">
              Follow Us
            </h3>
            <FooterHeadingLine />
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

        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 border-t border-copper/30 pt-6 sm:flex-row dark:border-white/10">
          <p className="font-sans text-[12px] text-espresso/70 dark:text-cream/60">
            © {new Date().getFullYear()} Finasto.™ All Rights Reserved.
          </p>
          <div className="flex gap-5">
            <FooterLink href="/privacy-policy" className={legalLinkClass}>
  Privacy Policy
</FooterLink>
           <FooterLink href="/terms" className={legalLinkClass}>
  Terms of Service
</FooterLink>
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}