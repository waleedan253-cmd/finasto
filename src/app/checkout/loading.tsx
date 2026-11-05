export default function CheckoutLoading() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-cream-soft bg-pattern"
    >
      <div className="relative h-14 w-14">
        <span className="absolute inset-0 rounded-full border-2 border-green-deep/15" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-copper motion-reduce:animate-none" />
        <span className="absolute inset-[10px] rounded-full bg-green-deep/10" />
      </div>
      <div className="text-center">
        <p className="font-display text-[22px] leading-tight text-espresso">
          Preparing your checkout
        </p>
        <p className="mt-1 font-sans text-[13px] text-warm-gray">
          Just a moment...
        </p>
      </div>
      <span className="sr-only">Loading checkout</span>
    </main>
  );
}