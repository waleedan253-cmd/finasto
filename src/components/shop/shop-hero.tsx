import Image from "next/image";
export function ShopHero() {
  return (
    <section className="border-b border-border bg-espresso">
      <div className="mx-auto grid max-w-[1440px] items-center md:grid-cols-2">
        <div className="px-5 py-12 sm:px-8 md:px-12 md:py-20 lg:px-16">
          <p className="font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
            Premium Coffee & Tea
          </p>
          <h1 className="mt-3 font-display text-[44px] leading-tight text-cream deep md:text-[72px]">
            Our Shop
          </h1>
          <p className="mt-4 max-w-md font-sans text-[15px] leading-relaxed text-warm-gray md:text-[16px]">
            Discover a world of premium coffee and tea, carefully selected for
            your everyday rituals.
          </p>
        </div>
        <div className="w-full">
          <Image
            src="/shop/shop-brand.png"
            alt="Premium Arabica coffee bag with a cup of coffee, coffee beans and a glass teapot"
            width={1200}
            height={900}
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
