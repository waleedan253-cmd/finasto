// // import type { Metadata } from "next";
// // import { Row, Col, Typography } from "antd";
// // import { CheckoutForm } from "@/components/checkout/checkout-form";
// // import { OrderSummary } from "@/components/checkout/order-summary";

// // import { CheckoutHeader } from "@/components/checkout/checkout-header";

// // export const metadata: Metadata = {
// //   title: "Checkout — Finasto",
// //   robots: { index: false, follow: false },
// // };

// // export default function CheckoutPage() {
// //   return (
// //     <main className="flex-1 bg-pattern py-10 sm:py-14">
// //       <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
// //         <CheckoutHeader />

// //         <Row gutter={[32, 32]} className="mt-6">
// //           <Col xs={24} md={13}>
// //             <CheckoutForm />
// //           </Col>
// //           <Col xs={24} md={11}>
// //                         <OrderSummary />
// //           </Col>
// //         </Row>
// //       </div>
// //     </main>
// //   );
// // }

// import type { Metadata } from "next";
// import { Row, Col } from "antd";
// import { CheckoutForm } from "@/components/checkout/checkout-form";
// import { OrderSummary } from "@/components/checkout/order-summary";
// import { CheckoutHeader } from "@/components/checkout/checkout-header";

// export const metadata: Metadata = {
//   title: "Checkout — Finasto",
//   robots: { index: false, follow: false },
// };

// export default function CheckoutPage() {
//   return (
//     <main className="flex-1 bg-pattern py-10 sm:py-14">
//       <div className="mx-auto max-w-[1100px] px-4 sm:px-8">
//         <CheckoutHeader />

//         <Row gutter={[32, 32]} className="mt-8">
//           <Col xs={24} md={13}>
//             <CheckoutForm />
//           </Col>
//           <Col xs={24} md={11}>
//             {/* Stays in view while the form scrolls on tablet/desktop */}
//             <div className="md:sticky md:top-6">
//               <OrderSummary />
//             </div>
//           </Col>
//         </Row>
//       </div>
//     </main>
//   );
// }
import type { Metadata } from "next";
import { Row, Col } from "antd";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutHeader } from "@/components/checkout/checkout-header";

export const metadata: Metadata = {
  title: "Checkout — Finasto",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main className="relative isolate flex-1 overflow-hidden bg-pattern py-10 sm:py-14">
      {/* Decorative background glows — sit behind content, ignore pointer events */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-24 -top-24 h-[320px] w-[320px] rounded-full bg-copper/15 blur-3xl sm:h-[460px] sm:w-[460px]" />
        <div className="absolute -right-28 top-1/3 h-[300px] w-[300px] rounded-full bg-green/10 blur-3xl sm:h-[420px] sm:w-[420px]" />
        <div className="absolute -bottom-32 left-1/4 h-[280px] w-[280px] rounded-full bg-espresso/10 blur-3xl sm:h-[380px] sm:w-[380px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1100px] px-4 sm:px-8">
        <CheckoutHeader />

        <Row gutter={[32, 32]} className="mt-8">
          <Col xs={24} md={13}>
            <CheckoutForm />
          </Col>
          <Col xs={24} md={11}>
            {/* Stays in view while the form scrolls on tablet/desktop */}
            <div className="md:sticky md:top-6">
              <OrderSummary />
            </div>
          </Col>
        </Row>
      </div>
    </main>
  );
}