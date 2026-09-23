import Image from "next/image";
import Link from "next/link";
import { storyContent } from "@/data/home";

/**
 * Full-bleed diagonal split: Bali landscape (darkened for text contrast)
 * on the left, tea cup product shot on a light panel bleeding in from
 * the right along a clipped diagonal edge.
 */
export function BrandStory() {
  return (
    <section className="relative isolate min-h-[520px] w-full overflow-hidden bg-espresso-deep sm:min-h-[420px] lg:min-h-[480px]">
      {/* Landscape background */}
      <Image
        src="/story/story-bali-landscape.png"
        alt="Terraced rice fields and a Balinese temple at sunrise, seen through tropical foliage"
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Darken for text contrast */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-espresso-deep/85 via-espresso-deep/55 to-transparent"
      />

      {/* Tea cup panel, diagonal clip, right side */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 z-0 h-[42%] w-[48%] bg-transparent sm:inset-y-0 sm:h-auto sm:w-[46%] sm:bg-cream-soft sm: hidden"
        style={{
          clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      >
        <div className="relative h-full w-full">
          <Image
            src="/story/story-tea-cups.png"
            alt="Glass cup of brewed Finasto tea surrounded by fresh tea leaves and a frangipani flower"
            fill
            sizes="46vw"
            className="object-contain object-center p-3 sm:p-9 sm:pl-16s"
          />
        </div>
      </div>

      {/* Copy */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] items-center px-5 py-16 sm:px-8 lg:py-20">
        <div className="max-w-md">
          <p className="flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper-light">
            {storyContent.eyebrow}
            <span aria-hidden="true" className="h-px w-10 bg-copper-light" />
          </p>
          <h2 className="mt-4 font-display text-[32px] leading-[1.15] text-white sm:text-[40px]">
            {storyContent.heading[0]}
            <br />
            {storyContent.heading[1]}
          </h2>
          <p className="mt-4 font-sans text-[14px] leading-relaxed text-white/80 sm:text-[15px]">
            {storyContent.paragraph}
          </p>
          <Link
            href={storyContent.cta.href}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-green px-6 font-sans text-[14px] font-medium text-white transition-colors hover:bg-green-deep"
          >
            {storyContent.cta.label}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
