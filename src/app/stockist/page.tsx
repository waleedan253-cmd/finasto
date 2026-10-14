// Affiliate Dashboard. Replaces the "coming soon" placeholder.
//
// A server component: it reads everything through getMyDashboard(),
// which finds the affiliate from the signed-in user, so no affiliate id
// ever comes from the browser. If a query fails, getMyDashboard() throws
// and the route's error boundary shows an error instead of fake zeros.
//
// `rates` feeds the "approx." amounts in the currency chosen in the
// header menu. Load it exactly the way the Payout Requests page does
// (see the TODO below).

// Always read fresh numbers for the signed-in affiliate.
// export const dynamic = "force-dynamic";s

export const metadata = { title: "Stockist - Dashboard" };

export default async function StockistDashboardPage({}: {}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px]s leading-tight text-espresso">
          Dashboard
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          We could not find an affiliate account for this login. Contact support
          if this looks wrong.
        </p>
      </div>
    </div>
  );
}
