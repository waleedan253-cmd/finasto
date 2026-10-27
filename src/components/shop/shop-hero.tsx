// import Image from "next/image";
// import Link from "next/link";
// import { BackgroundVideo } from "./BackgroundVideo";

// export function ShopHero() {
//   return (
//     <section className="relative isolate w-full overflow-hidden">
//       <div className="relative min-h-[360px]">
//         {/* Fallback image (also the poster until the video is ready) */}
//         <Image
//           src="/shop/Rustic Coffee and Tea Plantation Still Life.png"
//           alt=""
//           fill
//           priority
//           sizes="100vw"
//           className="object-cover object-center"
//         />

//         <BackgroundVideo
//           src="https://res.cloudinary.com/v3yvl8gm/video/upload/v1792979062/Coffee_and_tea_video_background_20261026064137.mp4"
//           className="absolute inset-0 h-full w-full object-cover object-center"
//         />

//         {/* Scrim: guarantees text contrast on any frame */}
//         <div
//           aria-hidden="true"
//           className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10"
//         />

//         {/* Content */}
//         <div className="relative z-10 mx-auto flex min-h-[360px] max-w-7xl flex-col justify-center px-5 py-10 sm:px-8 lg:px-16">
//           <nav aria-label="Breadcrumb" className="font-sans text-xs text-[#ffffff]/70">
//             <Link href="/" className="hover:text-[#ffffff]">Home</Link>
//             <span className="mx-2">/</span>
//             <span className="text-[#ffffff]">Shop</span>
//           </nav>

//           <p className="mt-5 flex items-center gap-3 font-sans text-xs font-medium uppercase tracking-[0.22em] text-copper">
//             <span aria-hidden="true" className="h-px w-8 bg-copper" />
//             Premium Coffee &amp; Tea
//           </p>

//           <h1 className="mt-3 font-display text-4xl leading-[1.05] text-[#ffffff] md:text-6xl">
//             Our Shop
//             <span className="sr-only"> – Premium Bali Coffee &amp; Tea</span>
//           </h1>

//           <p className="mt-4 max-w-md font-sans text-sm leading-6  text-[#ffffff]/85 md:text-base md:leading-7">
//         Explore our collection of premium coffee and tea, thoughtfully curated to bring exceptional flavor and a touch of indulgence to every day.
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// }
import Image from "next/image";
import Link from "next/link";
import { BackgroundVideo } from "./BackgroundVideo";

export function ShopHero() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-[#0e0c09]">
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
        className="absolute inset-0 hidden h-full w-full object-cover object-center md:block motion-reduce:hidden"
      />

      {/* Scrim: strong on the text side, open on the product side */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent"
      />

      <div className="relative z-10 mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-16">
        {/* Copy */}
        <div>
          <nav aria-label="Breadcrumb" className="font-sans text-xs text-white/70">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Shop</span>
          </nav>

          <p className="mt-6 flex items-center gap-3 font-sans text-xs font-medium uppercase tracking-[0.22em] text-copper">
            <span aria-hidden="true" className="h-px w-8 bg-copper" />
             FINASTO Botanical Teas
          </p>

          <h1 className="mt-4 font-display text-4xl leading-[1.05] text-white md:text-6xl">
            Signature of Nature,
            <br />
            in every cup.
            <span className="sr-only"> – Premium Bali Coffee &amp; Tea</span>
          </h1>

          <p className="mt-5 max-w-md font-sans text-sm leading-6 text-white/85 md:text-base md:leading-7">
     Crafted in Indonesia from island botanicals. Uplifting by morning, calming by night.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="shop"
              className="rounded-full bg-copper px-6 py-3 font-sans text-sm font-medium text-white transition hover:brightness-110"
            >
              Shop the Collection ↓
            </Link>
            {/* <Link
              href="#discovery-duo"
              className="rounded-full border border-white/40 px-6 py-3 font-sans text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
            >
              Get the Discovery Duo
            </Link> */}
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-sans text-xs text-white/70">
            <li>Crafted in Indod</li>
            <li>10 sachets per box</li>
            <li>25 sachets per box</li>
    
          </ul>
        </div>

        {/* Product pair */}
        {/* <div className="relative mx-auto h-[340px] w-full max-w-[460px] sm:h-[440px] lg:h-[520px]">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-copper/25 blur-3xl"
          />
          <Image
            src="/shop/BlueMoon Botanical Tea Packaging.png"
            alt="FINASTO BlueMoon Botanical Infusion, 10 sachets"
            width={560}
            height={560}
            priority
            className="absolute left-0 top-6 w-[58%] -rotate-6 drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)] transition duration-500 hover:-translate-y-2 hover:-rotate-3"
          />
          <Image
            src="/shop/Flovera Botanical Tea Box.png"
            alt="FINASTO Flovera Botanical Tea, Green Jasmine and Floral Blend, 10 sachets"
            width={560}
            height={560}
            priority
            className="absolute bottom-0 right-0 w-[58%] rotate-6 drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)] transition duration-500 hover:-translate-y-2 hover:rotate-3"
          />
        </div> */}
      </div>
    </section>
  );
}