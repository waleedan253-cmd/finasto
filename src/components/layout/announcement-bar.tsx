import { announcements } from "@/data/site";

/**
 * Slim marquee strip above the header. Reads from `announcements` so an
 * admin can later add or rotate messages without touching this component.
 * Static/looping via CSS animation; respects prefers-reduced-motion.
 */
export function AnnouncementBar() {
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
              <span
                key={`${item.id}-${i}`}
                className="mx-8 font-sans text-xs tracking-wide sm:text-[13px]"
              >
                {item.message}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
