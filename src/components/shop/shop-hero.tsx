import Image from "next/image";
import Link from "next/link";
import { BackgroundVideo } from "./BackgroundVideo";

export function ShopHero() {
  return (
    <section className="relative isolate w-full overflow-hidden">
      <div className="relative min-h-[360px]">
        {/* Fallback image (also the poster until the video is ready) */}
        <Image
          src="/shop/Rustic Coffee and Tea Plantation Still Life.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <BackgroundVideo
          src="https://res.cloudinary.com/v3yvl8gm/video/upload/v1792979062/Coffee_and_tea_video_background_20261026064137.mp4"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Scrim: guarantees text contrast on any frame */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10"
        />

        {/* Content */}
        <div className="relative z-10 mx-auto flex min-h-[360px] max-w-7xl flex-col justify-center px-5 py-10 sm:px-8 lg:px-16">
          <nav aria-label="Breadcrumb" className="font-sans text-xs text-[#ffffff]/70">
            <Link href="/" className="hover:text-[#ffffff]">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[#ffffff]">Shop</span>
          </nav>

          <p className="mt-5 flex items-center gap-3 font-sans text-xs font-medium uppercase tracking-[0.22em] text-copper">
            <span aria-hidden="true" className="h-px w-8 bg-copper" />
            Premium Coffee &amp; Tea
          </p>

          <h1 className="mt-3 font-display text-4xl leading-[1.05] text-[#ffffff] md:text-6xl">
            Our Shop
            <span className="sr-only"> – Premium Bali Coffee &amp; Tea</span>
          </h1>

          <p className="mt-4 max-w-md font-sans text-sm leading-6  text-[#ffffff]/85 md:text-base md:leading-7">
        Explore our collection of premium coffee and tea, thoughtfully curated to bring exceptional flavor and a touch of indulgence to every day.
          </p>
        </div>
      </div>
    </section>
  );
}