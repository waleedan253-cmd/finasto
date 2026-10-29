import Image from "next/image";
import Link from "next/link";
import { storyContent } from "@/data/home";
import { BackgroundVideo } from "./BackgroundVideo";

/**
 * Full-bleed diagonal split: Bali landscape (darkened for text contrast)
 * on the left, tea cup product shot on a light panel bleeding in from
 * the right along a clipped diagonal edge.
 */
export function BrandStory() {
  return (
    <section className="bg-pattern dark relative isolate min-h-[520px] w-full overflow-hidden sm:min-h-[420px] lg:min-h-[480px]">
      {/* Landscape background */}
      <Image
        src="/story/golden-dawn-bali-rice-terraces.png"
        alt="Terraced rice fields and a Balinese temple at sunrise, seen through tropical foliage"
        fill
        sizes="100vw"
        className="object-cover object-center "
      />
      {/* Darken for text contrast */}
         <BackgroundVideo
        src="https://res.cloudinary.com/v3yvl8gm/video/upload/v1792832151/1024.mp4"
        className="absolute inset-0 h-full w-full object-cover object-center dark:brightness-90"
      />
          

     
      {/* Copy */}
      <div className=" relative z-10 px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-16">
        <div
      aria-hidden="true"
      className="pointer-events-none absolute -inset-x-5 -inset-y-8 -z-10 bg-gradient-to-r from-cream/90 via-cream/65 to-transparent blur-2xl sm:-inset-x-8"
    />
        <div className="max-w-md">
          <p className="flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
            {storyContent.eyebrow}
            <span aria-hidden="true" className="h-px w-10 bg-copper" />
          </p>
          <h2 className="mt-4 font-display text-[32px] leading-[1.15] text-green-deep sm:text-[40px]">
            {storyContent.heading[0]}
            <br />
            {storyContent.heading[1]}
          </h2>
          <p className="mt-4 font-sans text-[14px] leading-relaxed text-warm-gray sm:text-[15px]">
            {storyContent.paragraph}
          </p>
          <Link
            href={storyContent.cta.href}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-green-deep px-6 font-sans text-[14px] font-medium text-cream-soft transition-all hover:gap-3 hover:brightness-110"
          >
            {storyContent.cta.label}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
