import Link from "next/link";
import { getLiveAnnouncements } from "@/lib/admin/announcement-queries";
import type { LiveAnnouncement } from "@/lib/admin/announcement-queries";

/**
 * Slim marquee strip above the header. A server component: it reads the
 * live announcements from Supabase (cached, refreshed when admin saves),
 * so a new message goes live without a redeploy.
 * Static/looping via CSS animation; respects prefers-reduced-motion.
 */

const ITEM_CLASS = "mx-8 font-sans text-xs tracking-wide sm:text-[13px]";

function Message({ item }: { item: LiveAnnouncement }) {
  if (!item.link) return <span className={ITEM_CLASS}>{item.message}</span>;

  const className = `${ITEM_CLASS} underline-offset-4 hover:underline`;

  // Same-site paths use Next's Link; external https links open in a new tab.
  if (item.link.startsWith("/")) {
    return (
      <Link href={item.link} className={className}>
        {item.message}
      </Link>
    );
  }
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {item.message}
    </a>
  );
}

export async function AnnouncementBar() {
  let announcements: LiveAnnouncement[] = [];
  try {
    announcements = await getLiveAnnouncements();
  } catch {
    // A failed banner must never break the storefront. Show nothing.
    return null;
  }

  if (announcements.length === 0) return null;

  const REPEAT = 4;
  const group = Array.from({ length: REPEAT }, () => announcements).flat();

  return (
    <div className="w-full overflow-hidden bg-espresso text-cream">
      <div className="flex w-max animate-marquee whitespace-nowrap py-2">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center"
          >
            {group.map((item, i) => (
              <Message key={`${item.id}-${i}`} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
