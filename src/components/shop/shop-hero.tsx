import Image from "next/image";
export function ShopHero() {
  return (
    <section className="relative overflow-hidden border-b border-border-strong bg-gradient-to-b from-cream to-cream-soft">
      <div className="mx-auto grid max-w-[1440px] items-center md:grid-cols-2">
        <div className="relative z-10 px-5 py-12 sm:px-8 md:px-12 md:py-20 lg:px-16">
          <p className="flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
            <span aria-hidden="true" className="h-px w-8 bg-copper" />
            Premium Coffee &amp; Tea
          </p>
          <h1 className="mt-3 font-display text-[44px] leading-[1.05] text-green-deep md:text-[68px]">
            Our Shop
            <span className="sr-only"> – Premium Bali Coffee &amp; Tea</span>
          </h1>
          <p className="mt-4 max-w-md font-sans text-[15px] leading-relaxed text-warm-gray md:text-[16px]">
            Discover a world of premium coffee and tea, carefully selected for
            your everyday rituals.
          </p>
        </div>
        <div className="w-full md:[mask-image:linear-gradient(to_right,transparent,black_18%)] md:[-webkit-mask-image:linear-gradient(to_right,transparent,black_18%)]">
          <Image
            src="/shop/shop-brand.png"
            alt="Premium Arabica coffee bag with a cup of coffee, coffee beans and a glass teapot"
            width={1200}
            height={900}
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="h-auto w-full dark:rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
}
