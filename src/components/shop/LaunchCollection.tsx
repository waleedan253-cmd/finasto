import Image from "next/image";
import Link from "next/link";

const products = [
  {
    slug: "bluemoon",
    name: "BlueMoon",
    type: "Botanical Infusion",
    ritual: "Evening Ritual",
    tagline: "A blend of flowers & herbs for calm evenings.",
    notes: ["Butterfly pea", "Lavender", "Chamomile", "Ginger", "Lemongrass"],
    image: "/shop/BlueMoon Botanical Tea Packaging.png",
    bg: "from-[#0b1f4a] via-[#14306e] to-[#2a56b8]",
    glow: "bg-[#5b8cff]/30",
  },
  {
    slug: "flovera",
    name: "Flovera",
    type: "Botanical Tea",
    ritual: "Morning Ritual",
    tagline: "Green jasmine tea & floral blend for bright mornings.",
    notes: ["Green jasmine tea", "Rose", "Jasmine", "Lemongrass"],
    image: "/shop/Flovera Botanical Tea Box.png",
    bg: "from-[#0f2d1d] via-[#1b4a31] to-[#2f6b47]",
    glow: "bg-[#6fe3a1]/25",
  },
];

export function LaunchCollection() {
  return (
    <section
      id="launch-collection"
      className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-16"
    >
      {/* Heading */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.22em] text-copper">
          The Launch Collection
        </p>
        <h2 className="mt-3 font-display text-3xl md:text-5xl">
          Two blends. One ritual.
        </h2>
        <p className="mt-4 font-sans text-sm text-neutral-600 md:text-base">
          Our first botanical teas, each in a 10-sachet box.
        </p>
      </div>

      {/* Showcase panels */}
      <div className="mt-14 space-y-8">
        {products.map((p, i) => (
          <article
            key={p.slug}
            className={`group relative grid items-center gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br ${p.bg} p-8 text-white md:grid-cols-2 md:p-14`}
          >
            {/* Ambient glow */}
            <div
              aria-hidden
              className={`pointer-events-none absolute -top-24 h-80 w-80 rounded-full blur-3xl ${p.glow} ${
                i % 2 === 0 ? "-right-16" : "-left-16"
              }`}
            />

            {/* Pack image */}
            <div
              className={`relative mx-auto h-72 w-full md:h-96 ${
                i % 2 === 0 ? "md:order-2" : "md:order-1"
              }`}
            >
              <Image
                src={p.image}
                alt={`${p.name} ${p.type}`}
                fill
                sizes="(min-width: 768px) 40vw, 90vw"
                className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)] transition duration-700 group-hover:scale-105 group-hover:-rotate-2"
              />
            </div>

            {/* Story */}
            <div
              className={`relative ${i % 2 === 0 ? "md:order-1" : "md:order-2"}`}
            >
              <span className="inline-block rounded-full border border-white/30 px-3 py-1 font-sans text-[11px] uppercase tracking-widest">
                Launch Edition
              </span>

              <p className="mt-6 font-sans text-xs uppercase tracking-[0.25em] text-white/60">
                {p.ritual}
              </p>
              <h3 className="mt-2 font-display text-4xl md:text-6xl">{p.name}</h3>
              <p className="mt-1 font-sans text-xs uppercase tracking-[0.2em] text-white/70">
                {p.type} · 10 sachets
              </p>

              <p className="mt-5 max-w-md font-sans text-base text-white/85">
                {p.tagline}
              </p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {p.notes.map((n) => (
                  <li
                    key={n}
                    className="rounded-full bg-white/10 px-3 py-1 font-sans text-xs backdrop-blur"
                  >
                    {n}
                  </li>
                ))}
              </ul>

              {/* <Link
                href={`/shop/${p.slug}`}
                className="mt-8 inline-flex items-center gap-2 border-b border-white/40 pb-1 font-sans text-sm tracking-wide transition hover:gap-3 hover:border-white"
              >
                Explore the blend <span aria-hidden>→</span>
              </Link> */}
            </div>
          </article>
        ))}
      </div>

      {/* Hand-off to the dynamic grid */}
      {/* <div className="mt-12 text-center">
        <Link
          href="#shop"
          className="font-sans text-sm uppercase tracking-[0.22em] text-neutral-700 transition hover:text-copper"
        >
          Shop the full collection ↓
        </Link>
      </div> */}
    </section>
  );
}