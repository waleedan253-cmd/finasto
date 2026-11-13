// import type { Metadata } from "next";
// import Link from "next/link";
// import { PolicyPage, PolicySection } from "@/components/shop/policy-page";

// export const metadata: Metadata = {
//   title: "Terms of Service",
//   description:
//     "The terms that apply when you browse and buy from the Finasto store.",
// };

// // EDIT BEFORE LAUNCH: replace the governing law and the company name with
// // your real ones, and have the final text reviewed by a lawyer.
// const UPDATED = "October 2026";

// const list = "list-disc space-y-1.5 pl-5 marker:text-copper";
// const link = "font-medium text-copper underline-offset-4 hover:underline";

// export default function TermsPage() {
//   return (
//     <PolicyPage
//       path="/terms"
//       eyebrow="Legal"
//       title="Terms of Service"
//       intro="By using this website or placing an order, you agree to these terms. Please read them, and contact us if anything is unclear."
//       updated={UPDATED}
//     >
//       <PolicySection id="using" title="Using the store">
//         <ul className={list}>
//           <li>You must be 18 or older, or have a parent or guardian&apos;s permission, to place an order.</li>
//           <li>Give accurate information and keep your account password private.</li>
//           <li>Do not misuse the site, attempt to disrupt it, or use it for anything unlawful.</li>
//         </ul>
//       </PolicySection>

//       <PolicySection id="orders" title="Orders and prices">
//         <p>
//           An order is a request to buy. It is accepted when we confirm it by
//           email, and we may decline or cancel an order, for example for stock
//           errors, pricing mistakes or suspected fraud. If we cancel a paid
//           order, you receive a full refund.
//         </p>
//         <p>
//           Prices are shown in your selected currency and may change at any time.
//           Taxes and shipping are shown at checkout. Prices in other currencies
//           are approximate, and the amount charged is the one shown at payment.
//         </p>
//       </PolicySection>

//       <PolicySection id="delivery-returns" title="Delivery and returns">
//         <p>
//           Delivery times and costs are described on our{" "}
//           <Link href="/shipping" className={link}>
//             Shipping & Delivery
//           </Link>{" "}
//           page, and returns and refunds on our{" "}
//           <Link href="/returns" className={link}>
//             Returns & Refunds
//           </Link>{" "}
//           page. Both are part of these terms.
//         </p>
//       </PolicySection>

//       <PolicySection id="affiliates" title="Affiliate programme">
//         <p>
//           Affiliates earn commission under the rate and rules shown in their
//           account. Commission is paid on eligible orders after the refund
//           window, and it is reduced or reversed for refunded or cancelled
//           orders. We may pause or end an affiliate account that breaks these
//           terms.
//         </p>
//       </PolicySection>

//       <PolicySection id="ip" title="Intellectual property">
//         <p>
//           The Finasto name, logo, images and website content belong to us or our
//           licensors. You may not copy or use them commercially without our
//           written permission.
//         </p>
//       </PolicySection>

//       <PolicySection id="liability" title="Liability">
//         <p>
//           Our products are food and drink. Please check the ingredients before
//           you consume them. To the fullest extent the law allows, we are not
//           liable for indirect or consequential losses, and our total liability
//           for an order is limited to the amount you paid for it. Nothing in
//           these terms limits your legal rights as a consumer, or liability that
//           cannot be limited by law.
//         </p>
//       </PolicySection>

//       <PolicySection id="law" title="Governing law">
//         <p>
//           These terms are governed by the laws of Indonesia, unless your local
//           consumer law requires otherwise. Disputes are handled by the courts
//           of that country, and we encourage you to contact us first so we can
//           resolve it.
//         </p>
//       </PolicySection>

//       <PolicySection id="changes" title="Changes and contact">
//         <p>
//           We may update these terms and will change the date at the top when we
//           do. Using the store after a change means you accept it. Questions?{" "}
//           <Link href="/contact" className={link}>
//             Contact us
//           </Link>{" "}
//           or read our{" "}
//           <Link href="/privacy-policy" className={link}>
//             Privacy Policy
//           </Link>
//           .
//         </p>
//       </PolicySection>
//     </PolicyPage>
//   );
// }

import type { Metadata } from "next";
import Link from "next/link";
import {
  PackageCheck,
  Scale,
  ShieldAlert,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import {
  PolicyPage,
  PolicySection,
  AnimatedCard,
  GlowIcon,
} from "@/components/shop/policy-page";
import { Callout } from "@/components/shop/callout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply when you browse, buy from or promote FINASTO™: orders, prices, delivery, returns, the affiliate programme and more.",
};

const UPDATED = "November 2026";

type Item = { icon: LucideIcon; title: string; text: string };

const highlights: Item[] = [
  {
    icon: UserCheck,
    title: "Clear ground rules",
    text: "Be 18 or have a guardian’s permission, and give accurate details.",
  },
  {
    icon: PackageCheck,
    title: "Shipping and returns included",
    text: "Our Shipping and Returns policies are part of these Terms.",
  },
  {
    icon: Scale,
    title: "Your rights stay protected",
    text: "Nothing here removes consumer rights that apply by law.",
  },
];

const list = "list-disc space-y-1.5 pl-5 marker:text-copper";
const linkClass =
  "font-medium text-copper underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";
const subheading = "font-sans text-[15px] font-semibold text-espresso";

export default function TermsPage() {
  return (
    <PolicyPage
      path="/terms"
      eyebrow="terms of sevices "
      title="Terms of Service"
      intro="These Terms govern your access to and use of our website, products, promotional programmes and related services. Please read them before using our website or purchasing our products."
      updated={UPDATED}
    >
      {/* Highlights */}
      <ul className="grid gap-4 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, text }, i) => (
          <AnimatedCard
            as="li"
            key={title}
            delay={i * 0.1}
            className="finasto-card relative overflow-hidden p-6 pt-7"
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-copper via-copper-light to-copper"
            />
            <GlowIcon className="h-12 w-12 bg-gradient-to-br from-green-deep to-green text-cream ring-2 ring-copper/50 ring-offset-2 ring-offset-cream">
              <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </GlowIcon>
            <h2 className="mt-5 font-sans text-[16px] font-semibold text-espresso">
              {title}
            </h2>
            <p className="mt-1.5 font-sans text-[13.5px] leading-relaxed text-warm-gray">
              {text}
            </p>
          </AnimatedCard>
        ))}
      </ul>

      {/* Intro */}
      <div className="space-y-4">
        <p>
          Welcome to FINASTO™. By accessing our website, creating an account,
          placing an order or participating in a FINASTO™ promotional
          programme, you acknowledge that you have had the opportunity to
          review these Terms and agree to the provisions applicable to your
          activities.
        </p>
      </div>

      <PolicySection id="using" title="1. Use of Our Website">
        <p>By using our website, you confirm that:</p>
        <ul className={list}>
          <li>
            You are at least 18 years old or have the required permission of a
            parent or legal guardian.
          </li>
          <li>All information you provide is accurate, complete and up to date.</li>
          <li>You will keep your account credentials confidential.</li>
          <li>You will use our website only for lawful purposes.</li>
          <li>
            You will not misuse, damage, interfere with or attempt to gain
            unauthorised access to our website or systems.
          </li>
        </ul>
        <p>
          You must not use our website to engage in fraudulent activities,
          submit misleading information, distribute malicious software,
          interfere with website operations or violate the rights of FINASTO™
          or any other party.
        </p>
        <p>
          FINASTO™ reserves the right to restrict, suspend or terminate access
          to accounts involved in suspected fraud, abuse, unlawful activities
          or violations of these Terms, subject to applicable law.
        </p>
      </PolicySection>

      <PolicySection id="products" title="2. Products and Product Information">
        <p>
          FINASTO™ makes reasonable efforts to ensure that product
          descriptions, images, ingredients, packaging information and prices
          displayed on our website are accurate. However:
        </p>
        <ul className={list}>
          <li>
            Product images are for illustrative purposes and actual packaging
            or appearance may vary slightly.
          </li>
          <li>
            Product availability, packaging and product specifications may
            change from time to time.
          </li>
          <li>
            Natural ingredients may have minor variations in appearance,
            colour, aroma or characteristics.
          </li>
          <li>
            Product descriptions should be read together with the actual
            product packaging and applicable labelling information.
          </li>
        </ul>
        <Callout icon={ShieldAlert}>
          <p>
            Customers are responsible for reviewing ingredient lists, allergen
            information, preparation instructions and other relevant product
            information before purchasing or consuming any product. Customers
            with food allergies, sensitivities or specific dietary
            requirements should carefully check the product information before
            consumption.
          </p>
        </Callout>
        <p>
          FINASTO™ does not make medical or therapeutic claims through these
          Terms of Service. Our products are not intended to replace
          professional medical advice or prescribed treatment.
        </p>
      </PolicySection>

      <PolicySection id="orders" title="3. Orders and Order Acceptance">
        <p>
          Placing an order through our website constitutes an offer to purchase
          the selected products.
        </p>
        <p>
          An order is not considered accepted until FINASTO™ issues an order
          confirmation or otherwise confirms acceptance through an authorised
          communication channel.
        </p>
        <p>
          FINASTO™ reserves the right to reject, hold, cancel or limit an
          order where reasonably necessary, including in circumstances
          involving:
        </p>
        <ul className={list}>
          <li>Incorrect or incomplete customer information.</li>
          <li>Suspected fraudulent or unauthorised transactions.</li>
          <li>Duplicate or unusual orders.</li>
          <li>Product unavailability or stock discrepancies.</li>
          <li>Genuine pricing, listing or technical errors.</li>
          <li>Suspected misuse of promotional offers or discount codes.</li>
          <li>Legal, regulatory or operational restrictions.</li>
        </ul>
        <p>
          Where a paid order is cancelled by FINASTO™ and no alternative
          resolution is agreed, the applicable refund will be processed in
          accordance with our{" "}
          <Link href="/returns" className={linkClass}>
            Returns & Refunds
          </Link>{" "}
          policy and applicable law.
        </p>
        <p>
          Customers are responsible for reviewing their order details before
          completing payment.
        </p>
      </PolicySection>

      <PolicySection id="prices" title="4. Prices, Payments and Taxes">
        <p>
          All prices are displayed in the currency selected on our website,
          subject to the available currency and payment options.
        </p>
        <p>
          Prices, promotional offers and product availability may change before
          an order is accepted.
        </p>
        <p>
          The final amount payable is the amount presented at checkout before
          payment confirmation, including applicable shipping charges and
          taxes where displayed.
        </p>
        <p>
          Currency conversions, bank charges, international transaction fees
          and other charges imposed by payment providers or financial
          institutions may vary and are subject to their respective terms.
        </p>
        <p>
          Payments must be completed through the payment methods made available
          at checkout.
        </p>
        <p>
          FINASTO™ does not request or require customers to disclose payment
          card security codes or full card details directly through unofficial
          communication channels.
        </p>
        <p>
          If a genuine pricing or technical error is identified, FINASTO™ may
          contact the customer to clarify the order or arrange cancellation and
          an applicable refund.
        </p>
      </PolicySection>

      <PolicySection id="promotions" title="5. Promotions and Discount Offers">
        <p>
          Promotional offers, discount codes and special campaigns may be
          subject to additional conditions, including validity periods, product
          restrictions, minimum purchase requirements and availability.
        </p>
        <p>Unless expressly stated otherwise:</p>
        <ul className={list}>
          <li>Promotional offers cannot be exchanged for cash.</li>
          <li>Discount codes may not be combined with other offers.</li>
          <li>Offers may not apply to previously completed orders.</li>
          <li>
            Promotional benefits may be limited to specified products,
            customers or periods.
          </li>
        </ul>
        <p>
          FINASTO™ reserves the right to withdraw, correct or restrict
          promotional offers where reasonably necessary, including in cases of
          misuse, fraud, technical errors or circumstances beyond our
          reasonable control.
        </p>
        <p>
          Any change will be handled in accordance with applicable law and any
          promotional commitment already accepted.
        </p>
      </PolicySection>

      <PolicySection id="delivery-returns" title="6. Delivery and Returns">
        <p>
          Shipping destinations, estimated delivery periods, shipping charges,
          tracking arrangements and delivery conditions are explained in our{" "}
          <Link href="/shipping" className={linkClass}>
            Shipping & Delivery
          </Link>{" "}
          policy.
        </p>
        <p>
          Return eligibility, refund procedures, replacement arrangements and
          order cancellation conditions are explained in our{" "}
          <Link href="/returns" className={linkClass}>
            Returns & Refunds
          </Link>{" "}
          policy.
        </p>
        <p>
          Both policies form part of these Terms of Service and should be read
          together with them.
        </p>
        <p>
          Delivery estimates are provided for guidance and may be affected by
          customs procedures, courier operations, weather conditions, public
          holidays and other circumstances outside FINASTO™’s reasonable
          control.
        </p>
        <p>
          Customers are responsible for providing accurate delivery information
          and ensuring that someone is available to receive the shipment where
          required.
        </p>
        <p>
          Nothing in these Terms removes any applicable customer rights
          relating to damaged, defective, expired, incorrect or missing
          products.
        </p>
      </PolicySection>

      <PolicySection
        id="affiliates"
        title="7. Affiliate and Brand Promoter Programme"
      >
        <p>
          FINASTO™ may independently establish, manage and operate an
          Affiliate and Brand Promoter Programme to promote its products and
          expand its market reach.
        </p>
        <p>
          FINASTO™ retains the sole discretion and authority to select,
          approve, appoint, register, manage, suspend or terminate any
          affiliate or Brand Promoter, subject to applicable law.
        </p>
        <p>
          Participation is voluntary and is subject to FINASTO™’s approval and
          the conditions below.
        </p>

        <Callout icon={ShieldAlert}>
          <p>
            <strong className="font-medium text-espresso">
              In short:
            </strong>{" "}
            commission is earned only on genuine, completed product sales you
            personally generate. There is no guaranteed income, and no reward
            for recruiting or registering other people.
          </p>
        </Callout>

        <h3 className={subheading}>7.1 Company-controlled appointment</h3>
        <ul className={list}>
          <li>
            Only FINASTO™ has the authority to appoint, approve, register or
            authorise affiliates and Brand Promoters.
          </li>
          <li>
            No affiliate or Brand Promoter has the authority to appoint,
            recruit, sponsor, register or enrol another person as an affiliate
            or Brand Promoter.
          </li>
          <li>
            All applications and appointments must be submitted directly to
            and approved by FINASTO™.
          </li>
          <li>
            No participant may transfer, delegate or share their appointment
            authority with another person.
          </li>
          <li>
            FINASTO™ independently determines participant eligibility,
            promotional authorisation and applicable commission arrangements.
          </li>
        </ul>

        <h3 className={subheading}>7.2 Independent promotional status</h3>
        <p>
          Each affiliate or Brand Promoter participates independently and is
          authorised only to promote FINASTO™ products within the scope of the
          applicable programme conditions.
        </p>
        <p>
          Participation does not automatically create an employment
          relationship, agency, partnership, franchise, joint venture or legal
          representation relationship with FINASTO™.
        </p>
        <p>
          Participants are not entitled to employee benefits, salaries, paid
          leave, insurance or other employment-related benefits solely by
          participating in the programme.
        </p>
        <p>
          The actual relationship between the parties will be determined in
          accordance with applicable law and the actual working arrangements.
        </p>

        <h3 className={subheading}>
          7.3 No authority to represent or bind FINASTO™
        </h3>
        <p>No affiliate or Brand Promoter may:</p>
        <ul className={list}>
          <li>
            Represent themselves as an employee, officer, manager or
            authorised representative of FINASTO™.
          </li>
          <li>Enter into contracts or agreements on behalf of FINASTO™.</li>
          <li>
            Make financial, legal or commercial commitments on behalf of
            FINASTO™.
          </li>
          <li>
            Promise discounts, refunds, benefits or special arrangements
            without written authorisation.
          </li>
          <li>
            Claim authority to appoint other affiliates or Brand Promoters.
          </li>
          <li>
            Use FINASTO™’s identity or branding in a misleading manner.
          </li>
        </ul>
        <p>
          Only persons expressly authorised in writing by FINASTO™ may exercise
          authority on its behalf, within the scope of that authorisation.
        </p>

        <h3 className={subheading}>7.4 Commission-based compensation</h3>
        <p>
          Approved participants may receive commissions solely for qualifying
          product sales directly attributable to their own authorised
          promotional activities, in accordance with the applicable commission
          schedule.
        </p>
        <p>
          Commission eligibility, calculation methods, payment arrangements and
          qualifying sales conditions will be communicated by FINASTO™.
        </p>
        <p>
          No commission is earned merely by registering, joining, introducing
          another participant or maintaining an account.
        </p>
        <p>
          Commission payments are subject to verification of genuine completed
          transactions and applicable programme conditions.
        </p>

        <h3 className={subheading}>
          7.5 No guaranteed income or financial results
        </h3>
        <p>
          FINASTO™ makes no guarantee or representation regarding any
          particular income, commission amount, sales volume, profit, customer
          acquisition or financial result.
        </p>
        <p>
          Actual earnings depend on genuine qualifying sales, individual
          promotional activities, customer demand, market conditions and
          compliance with programme requirements.
        </p>
        <p>
          Any income examples, estimates or promotional illustrations are
          provided for informational purposes only and do not constitute a
          promise or guarantee of future earnings.
        </p>
        <p>
          Participation is not an investment, deposit, savings arrangement or
          guaranteed business opportunity.
        </p>

        <h3 className={subheading}>7.6 No recruitment-based benefits</h3>
        <p>
          No financial benefit, commission, bonus or reward is payable solely
          for introducing, registering or appointing another participant.
        </p>
        <p>
          Participants are not authorised to establish independent recruitment
          structures or claim financial benefits arising from the activities of
          other participants.
        </p>
        <p>
          All programme participation and commission arrangements are
          administered directly by FINASTO™.
        </p>

        <h3 className={subheading}>7.7 Promotional conduct and brand protection</h3>
        <p>All participants must:</p>
        <ul className={list}>
          <li>Provide accurate and truthful product information.</li>
          <li>Follow FINASTO™’s approved promotional and brand guidelines.</li>
          <li>Avoid misleading, exaggerated or unverified product claims.</li>
          <li>Avoid unauthorised health, medical or therapeutic claims.</li>
          <li>
            Avoid false income statements or misleading business
            representations.
          </li>
          <li>
            Comply with applicable advertising, consumer protection and data
            protection requirements.
          </li>
          <li>
            Respect FINASTO™’s trademarks, intellectual property and brand
            reputation.
          </li>
        </ul>
        <p>
          Participants must not use spam, deceptive advertising, fraudulent
          traffic or unauthorised promotional methods.
        </p>
        <p>
          Participants must not collect customer payments or make promises on
          behalf of FINASTO™ unless expressly authorised in writing.
        </p>

        <h3 className={subheading}>7.8 Commission verification and adjustments</h3>
        <p>
          Commissions are payable only on genuine, completed and eligible
          product sales.
        </p>
        <p>
          FINASTO™ may review, verify, withhold, adjust, cancel or reverse
          commissions associated with cancelled or refunded orders, fraudulent
          transactions, duplicate orders, manipulated referrals or violations
          of programme conditions.
        </p>
        <p>
          Any adjustment will be handled in accordance with the applicable
          programme terms and mandatory legal requirements.
        </p>

        <h3 className={subheading}>7.9 Suspension and termination</h3>
        <p>
          FINASTO™ may reject applications, suspend participation or terminate
          programme access where there is reasonable evidence of fraud,
          misconduct, misleading representations, unauthorised activities,
          brand misuse or violations of these Terms.
        </p>
        <p>
          FINASTO™ may investigate reported conduct and take appropriate lawful
          action to protect its customers, business operations and brand.
        </p>
        <p>
          Termination does not remove payment obligations or other rights that
          have already accrued and cannot legally be excluded.
        </p>

        <h3 className={subheading}>
          7.10 Programme administration and amendments
        </h3>
        <p>
          FINASTO™ retains control over the administration, operation and
          management of the programme, including participant selection,
          promotional authorisations, commission arrangements and programme
          conditions.
        </p>
        <p>
          FINASTO™ may amend, suspend or discontinue the programme, subject to
          applicable law and existing contractual obligations.
        </p>
        <p>
          Material changes will be communicated through appropriate channels
          where required.
        </p>
      </PolicySection>

      <PolicySection id="ip" title="8. Intellectual Property">
        <p>
          All intellectual property associated with FINASTO™, including its
          name, trademarks, logos, product names, designs, photographs,
          graphics, website content, text and other materials, is owned by
          FINASTO™ or its respective licensors.
        </p>
        <p>
          No content may be copied, reproduced, distributed, modified,
          published, commercially exploited or used in connection with another
          business without prior written permission from the relevant rights
          holder.
        </p>
        <p>
          Purchasing a FINASTO™ product does not grant ownership of or
          commercial rights to any FINASTO™ intellectual property.
        </p>
        <p>
          Unauthorised use of our brand, trademarks, designs or content may
          result in appropriate legal action.
        </p>
      </PolicySection>

      <PolicySection
        id="availability"
        title="9. Website Availability and Technical Issues"
      >
        <p>
          FINASTO™ makes reasonable efforts to maintain the availability and
          functionality of its website. However, we do not guarantee
          uninterrupted, error-free or continuous access.
        </p>
        <p>Website access may occasionally be affected by:</p>
        <ul className={list}>
          <li>Maintenance and technical updates.</li>
          <li>Hosting or server interruptions.</li>
          <li>Internet or telecommunications failures.</li>
          <li>Cybersecurity incidents.</li>
          <li>Third-party service disruptions.</li>
          <li>Events outside our reasonable control.</li>
        </ul>
        <p>
          FINASTO™ may modify, suspend or discontinue website features or
          services where reasonably necessary for maintenance, security,
          operational or business reasons, subject to applicable legal
          obligations.
        </p>
        <p>
          We are not responsible for independent failures of third-party
          platforms, payment providers or telecommunications services to the
          extent permitted by applicable law.
        </p>
      </PolicySection>

      <PolicySection
        id="prohibited"
        title="10. Prohibited Activities and Fraud Prevention"
      >
        <p>Customers and website users must not:</p>
        <ul className={list}>
          <li>Use stolen, unauthorised or fraudulent payment methods.</li>
          <li>Submit false personal, billing or delivery information.</li>
          <li>
            Attempt to manipulate prices, promotions, referral tracking or
            commission calculations.
          </li>
          <li>Interfere with website security or functionality.</li>
          <li>
            Use automated systems to extract, copy or misuse website content
            without permission.
          </li>
          <li>
            Impersonate another person or misrepresent an affiliation with
            FINASTO™.
          </li>
          <li>
            Engage in activities that violate applicable laws or the rights of
            others.
          </li>
        </ul>
        <p>
          FINASTO™ reserves the right to investigate suspected violations,
          preserve relevant records, restrict access, suspend transactions and
          take appropriate action where permitted by law.
        </p>
        <p>
          Where necessary, relevant information may be disclosed to payment
          providers, service providers or competent authorities in accordance
          with applicable legal requirements.
        </p>
      </PolicySection>

      <PolicySection id="liability" title="11. Limitation of Liability">
        <p>
          To the fullest extent permitted by applicable law, FINASTO™ shall not
          be responsible for indirect, incidental or consequential losses
          arising from the use of our website or services, including loss of
          profits, business opportunities, anticipated savings or data, where
          such exclusion is legally permitted.
        </p>
        <p>FINASTO™ shall not be responsible for losses resulting from:</p>
        <ul className={list}>
          <li>Incorrect information supplied by customers.</li>
          <li>
            Misuse of products or failure to follow applicable instructions.
          </li>
          <li>
            Unauthorised access resulting from compromised customer account
            credentials.
          </li>
          <li>Independent third-party service interruptions.</li>
          <li>Events beyond FINASTO™’s reasonable control.</li>
          <li>
            Unlawful acts or negligence of third parties, where FINASTO™ is
            not legally responsible for those acts.
          </li>
        </ul>
        <p>
          Where liability can lawfully be limited, FINASTO™’s liability will be
          limited to the extent permitted by applicable law and assessed
          according to the circumstances of the relevant claim.
        </p>
        <p>
          Nothing in these Terms excludes or restricts liability, compensation
          obligations or customer rights that cannot legally be excluded or
          restricted under applicable law.
        </p>
      </PolicySection>

      <PolicySection id="indemnification" title="12. Indemnification">
        <p>
          To the extent permitted by applicable law, users are responsible for
          losses, costs or expenses directly arising from their unlawful
          conduct, fraud, intentional misuse of our website or infringement of
          third-party rights.
        </p>
        <p>
          Where such conduct causes FINASTO™ to incur reasonable losses or
          legal expenses, FINASTO™ reserves the right to seek recovery through
          lawful means.
        </p>
        <p>
          This provision does not apply to the extent that the relevant loss
          results from FINASTO™’s own conduct or where recovery is prohibited
          by applicable law.
        </p>
      </PolicySection>

      <PolicySection id="third-party" title="13. Third-Party Services and Links">
        <p>
          Our website may contain links to third-party websites, payment
          services, social media platforms or other external services.
        </p>
        <p>
          These services are independently operated and may be subject to
          separate terms, conditions and privacy policies.
        </p>
        <p>
          FINASTO™ does not control independent third-party websites or
          guarantee their availability, accuracy, security or content.
        </p>
        <p>
          Customers use external services subject to the applicable terms of
          those providers.
        </p>
      </PolicySection>

      <PolicySection
        id="law"
        title="14. Governing Law and Dispute Resolution"
      >
        <p>
          These Terms of Service are governed by the laws of the Republic of
          Indonesia, subject to any mandatory consumer protection provisions
          that apply to the relevant transaction.
        </p>
        <p>
          If a dispute arises, the parties are encouraged to first attempt to
          resolve it through good-faith communication with FINASTO™.
        </p>
        <p>
          Where a dispute cannot be resolved amicably, it may be referred to
          the competent dispute resolution body or court in accordance with
          applicable law.
        </p>
        <p>
          Nothing in this section restricts any mandatory consumer dispute
          resolution rights or procedures available under applicable law.
        </p>
      </PolicySection>

      <PolicySection id="changes" title="15. Changes to These Terms">
        <p>
          FINASTO™ reserves the right to revise or update these Terms of
          Service from time to time to reflect changes in our business
          operations, products, website features or applicable legal
          requirements.
        </p>
        <p>
          Updated terms will be published on this page together with a revised
          date.
        </p>
        <p>
          Changes will apply prospectively unless otherwise permitted by
          applicable law. Where required, customers will be notified or asked
          to provide renewed acceptance.
        </p>
        <p>
          Continued use of the website after updated terms become effective
          constitutes acceptance only to the extent legally recognised and
          where the required notice or consent process has been followed.
        </p>
      </PolicySection>

      <PolicySection id="general" title="16. General Provisions">
        <p>
          If any provision of these Terms is found to be invalid, unlawful or
          unenforceable, the remaining provisions will continue to apply to the
          extent permitted by law.
        </p>
        <p>
          Failure by FINASTO™ to exercise or enforce any right under these
          Terms does not constitute a waiver of that right.
        </p>
        <p>
          These Terms, together with the applicable policies referenced herein,
          govern the use of our website and the purchase of our products,
          subject to any separately agreed written terms.
        </p>
      </PolicySection>

      <PolicySection id="contact" title="17. Contact and Customer Support">
        <p>
          For questions concerning these Terms of Service, orders or website
          usage, please contact the FINASTO™ Customer Support Team through our{" "}
          <Link href="/contact" className={linkClass}>
            contact page
          </Link>
          .
        </p>
        <p>
          Please provide your order number and relevant information where your
          enquiry relates to a purchase.
        </p>
        <p>
          See also our{" "}
          <Link href="/privacy-policy" className={linkClass}>
            Privacy Policy
          </Link>
          .
        </p>
        <p className="text-[13px] italic text-warm-gray">
          FINASTO™ reserves all rights available to it under applicable law.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}