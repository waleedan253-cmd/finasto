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
    <section className="bg-pattern  relative isolate flex w-full flex-col overflow-hidden sm:block sm:min-h-[420px] lg:min-h-[480px]">
      {/* Landscape background */}
      
      <div className="relative aspect-video w-full sm:absolute sm:inset-0 sm:aspect-auto">
        {/* <Image
          src="/story/golden-dawn-bali-rice-terraces.png"
          alt="Terraced rice fields and a Balinese temple at sunrise, seen through tropical foliage"
          fill
          sizes="100vw"
          className="object-cover object-center"
        /> */}
        <BackgroundVideo
          src="https://res.cloudinary.com/v3yvl8gm/video/upload/v1794362718/WhatsApp_Video_2026-11-10_at_7.25.36_PM.mp4"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>
          

     
      {/* Copy */}
      <div className=" relative z-10 bg-[#f6efe3] px-5 py-12 sm:bg-transparent sm:px-8 sm:py-16 md:px-12 md:py-24 lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-5 -inset-y-8 -z-10 hidden bg-gradient-to-r from-cream/90 via-cream/65 to-transparent blur-2xl sm:block sm:-inset-x-8"
        />
        <div className="max-w-md">
          <p className="flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper"> 
            {storyContent.eyebrow}
            <span aria-hidden="true" className="h-px w-10 bg-copper" />
          </p>
          <h2 className="mt-4 font-display text-[32px] leading-[1.15] text-[#234d2a] sm:text-[40px] sm:text-green-deep">
            {storyContent.heading[0]}
            <br />
            {storyContent.heading[1]}
          </h2>
          <p className="mt-4 font-sans text-[14px] leading-relaxed text-[#321e18] sm:text-[15px] sm:text-warm-gray">
            {storyContent.paragraph}
          </p>
          <Link
            href={storyContent.cta.href}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full  bg-green-deep px-8 py-4 font-sans text-[14px] font-medium tracking-wide text-cream shadow-[0_12px_30px_-10px_rgba(35,77,42,0.6)] transition-all duration-300 hover:gap-4 hover:bg-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/70 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            {storyContent.cta.label}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
