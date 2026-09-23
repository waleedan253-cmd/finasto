import Image from "next/image";
import Link from "next/link";
import { footerColumns, socialLinks } from "@/data/site";
import { Flag } from "@/components/ui/flag";

const socialIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
};

export function SiteFooter() {
  return (
    <footer className="bg-espresso-deep text-espresso/80">
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          {/* Logo + market */}
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              className="flex items-center  "
              aria-label="Finasto home"
            >
              <Image
                src="/brand/finasto-logo.png"
                alt="Finasto"
                width={140}
                height={105}
                className="h-16 w-auto rounded-md bg-cream-soft p-1"
              />
            </Link>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:gap-x-16">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-cream">
                  {column.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="font-sans text-[14px] text-cream/70 transition-colors hover:text-copper-light"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social */}
          <div>
            <h3 className="font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-cream">
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-cream/70 transition-colors hover:border-copper-light hover:text-copper-light"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="font-sans text-[12px] text-cream/50">
            © {new Date().getFullYear()} Finasto. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link
              href="/privacy-policy"
              className="font-sans text-[12px] text-cream/50 hover:text-cream/80"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-sans text-[12px] text-cream/50 hover:text-cream/80"
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
