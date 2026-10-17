import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { getMyRequests } from "@/lib/stockist/stockist-requests-queries";
import { RequestForm } from "@/components/stockist/requests/request-form";
import { RequestsList } from "@/components/stockist/requests/requests-list";

// Stockist Requests page: ask Finasto to assign an affiliate to me by typing
// the affiliate's name, email and a description, and follow the status of the
// requests I have sent. A server component: it checks the role, loads my
// requests, and hands plain data to the two components.

export const metadata: Metadata = {
  title: "Requests",
};

export default async function StockistRequestsPage() {
  await requireRole("stockist");

  const requests = await getMyRequests();
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="font-display text-[26px] leading-tight text-espresso sm:text-[30px]">
          Ask Finasto to assign an affiliate to you.
          {pendingCount > 0
            ? ` You have ${pendingCount} pending ${
                pendingCount === 1 ? "request" : "requests"
              }.`
            : ""}
        </h1>
      </header>

      <section className="mb-8">
        <RequestForm />
      </section>

      <section>
        <h2 className="mb-3 font-display text-[20px] leading-tight text-espresso">
          My requests
        </h2>
        <RequestsList requests={requests} />
      </section>
    </div>
  );
}
