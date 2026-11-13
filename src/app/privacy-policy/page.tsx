// import type { Metadata } from "next";
// import Link from "next/link";
// import { PolicyPage, PolicySection } from "@/components/shop/policy-page";

// export const metadata: Metadata = {
//   title: "Privacy Policy",
//   description:
//     "How Finasto collects, uses and protects your personal information, and the choices you have.",
// };

// // EDIT BEFORE LAUNCH: replace the placeholders below (company name,
// // retention periods, service providers) and have the final text reviewed
// // by a lawyer for the countries you sell to.
// const UPDATED = "October 2026";

// const list = "list-disc space-y-1.5 pl-5 marker:text-copper";
// const link = "font-medium text-copper underline-offset-4 hover:underline";

// export default function PrivacyPolicyPage() {
//   return (
//     <PolicyPage
//       path="/privacy-policy"
//       eyebrow="Legal"
//       title="Privacy Policy"
//       intro="We collect only what we need to process your order and run our store. This page explains what we collect, why, and your choices."
//       updated={UPDATED}
//     >
//       <PolicySection id="collect" title="What we collect">
//         <ul className={list}>
//           <li>
//             <strong className="font-medium text-espresso">Order details:</strong>{" "}
//             name, email, phone, delivery and billing address, and the items you
//             buy.
//           </li>
//           <li>
//             <strong className="font-medium text-espresso">Account details:</strong>{" "}
//             email and a secured password, if you create an account.
//           </li>
//           <li>
//             <strong className="font-medium text-espresso">Usage data:</strong>{" "}
//             device, browser, pages visited and approximate location, collected
//             through cookies.
//           </li>
//         </ul>
//         <p>
//           We do not store your full card number. Payments are handled by our
//           payment providers.
//         </p>
//       </PolicySection>

//       <PolicySection id="use" title="How we use it">
//         <ul className={list}>
//           <li>To process, ship and support your orders.</li>
//           <li>To send order confirmations and delivery updates.</li>
//           <li>To prevent fraud and keep the store secure.</li>
//           <li>To improve our products and website.</li>
//           <li>To send marketing emails only if you agree. You can unsubscribe at any time.</li>
//         </ul>
//       </PolicySection>

//       <PolicySection id="share" title="Who we share it with">
//         <p>
//           We share information only with service providers who help us run the
//           store: payment processors, shipping carriers, hosting and email
//           providers. They may use it only to provide their service to us. We do
//           not sell your personal information.
//         </p>
//         <p>
//           We may also share information when the law requires it, or to protect
//           our rights and customers.
//         </p>
//       </PolicySection>

//       <PolicySection id="cookies" title="Cookies and referral links">
//         <p>
//           We use cookies to keep your cart, remember your market and currency,
//           and understand how the site is used. If you arrive through an
//           affiliate&apos;s referral link, we store a cookie so the order can be
//           credited to that affiliate. The first link you open is the one
//           credited, for up to one year. You can block cookies in your browser,
//           but parts of the store may stop working.
//         </p>
//       </PolicySection>

//       <PolicySection id="retention" title="How long we keep it">
//         <p>
//           We keep order records for as long as needed for tax, accounting and
//           legal reasons, and other data only as long as it is useful for the
//           purposes above. Then we delete or anonymise it.
//         </p>
//       </PolicySection>

//       <PolicySection id="rights" title="Your rights">
//         <p>
//           Depending on where you live, you can ask to see, correct, export or
//           delete your personal information, object to or limit how we use it,
//           and withdraw your consent at any time. To make a request,{" "}
//           <Link href="/contact" className={link}>
//             contact us
//           </Link>
//           . We reply within 30 days. If you are not satisfied, you may complain
//           to your local data protection authority.
//         </p>
//       </PolicySection>

//       <PolicySection id="security" title="Security and transfers">
//         <p>
//           We use encryption and access controls to protect your information. No
//           system is completely secure, so we cannot guarantee absolute
//           security. Your information may be processed in countries other than
//           your own, and we use safeguards that protect it wherever it goes.
//         </p>
//       </PolicySection>

//       <PolicySection id="children" title="Children">
//         <p>
//           Our store is not intended for children under 16, and we do not
//           knowingly collect their information.
//         </p>
//       </PolicySection>

//       <PolicySection id="changes" title="Changes and contact">
//         <p>
//           We may update this policy and will change the date at the top when we
//           do. For questions about privacy,{" "}
//           <Link href="/contact" className={link}>
//             contact us
//           </Link>
//           . See also our{" "}
//           <Link href="/terms" className={link}>
//             Terms of Service
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
  Cookie,
  CreditCard,
  FileLock2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  PolicyPage,
  PolicySection,
  AnimatedCard,
  GlowIcon,
} from "@/components/shop/policy-page";
import { Callout } from "@/components/shop/callout";
import { CookieSettingsButton } from "@/components/consent/cookie-settings-button";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How FINASTO™ collects, uses, shares and protects your personal information, and the choices you have.",
};

const UPDATED = "November 2026";

// Page that handles privacy requests (access, correction, deletion, etc.)
const PRIVACY_REQUEST_HREF = "/privacy-request";

type Item = { icon: LucideIcon; title: string; text: string };

const highlights: Item[] = [
  {
    icon: ShieldCheck,
    title: "We don’t sell your data",
    text: "Your personal information is never sold.",
  },
  {
    icon: CreditCard,
    title: "No card numbers stored",
    text: "Payments are handled by third-party payment providers.",
  },
  {
    icon: Cookie,
    title: "You control cookies",
    text: "Choose which optional cookies we may use.",
  },
];

const list = "list-disc space-y-1.5 pl-5 marker:text-copper";
const linkClass =
  "font-medium text-copper underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";
const subheading = "font-sans text-[15px] font-semibold text-espresso";
const strong = "font-medium text-espresso";

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      path="/privacy-policy"
      eyebrow="privacy policy"
      title="Privacy Policy"
      intro="This Privacy Policy explains what information FINASTO™ collects, how we use it, when it may be shared, how it is protected and how privacy-related enquiries are handled."
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

      {/* Intro + controls */}
      <div className="space-y-4">
        <p>
          At FINASTO™, we respect the privacy of our customers and website
          visitors. We are committed to handling personal information
          responsibly, maintaining appropriate security measures and using
          information for legitimate business purposes.
        </p>
        <p>
          By accessing or using our website, creating an account or placing an
          order, you acknowledge that you have had the opportunity to review
          this Privacy Policy. Where applicable, separate consent will be
          requested for activities that legally require it.
        </p>
        {/* <Callout icon={FileLock2}>
          <p className="mb-4">
            You can change your cookie choices at any time, or send us a
            privacy request to access, correct or delete your information.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <CookieSettingsButton />
            <Link href={PRIVACY_REQUEST_HREF} className={linkClass}>
              Make a privacy request
            </Link>
          </div>
        </Callout> */}
      </div>

      <PolicySection id="collect" title="1. Information We Collect">
        <p>
          Depending on how you interact with FINASTO™, we may collect the
          following information:
        </p>

        <h3 className={subheading}>Personal and contact information</h3>
        <ul className={list}>
          <li>Full name.</li>
          <li>Email address.</li>
          <li>Telephone or mobile number.</li>
          <li>Billing and delivery addresses.</li>
          <li>Other information voluntarily provided by you.</li>
        </ul>

        <h3 className={subheading}>Order and transaction information</h3>
        <ul className={list}>
          <li>Products purchased.</li>
          <li>Order numbers and purchase history.</li>
          <li>Payment status and transaction references.</li>
          <li>Billing, delivery and order-related information.</li>
        </ul>
        <p>
          FINASTO™ does not store your complete payment card number or card
          security code. Payment transactions are handled by third-party
          payment service providers according to their respective security and
          privacy practices.
        </p>

        <h3 className={subheading}>Account information</h3>
        <p>
          If you create an account, we may collect your email address,
          authentication information, account preferences and other
          information required to manage your account.
        </p>

        <h3 className={subheading}>Technical and website usage information</h3>
        <p>
          When you access our website, we or our service providers may collect
          technical information, including:
        </p>
        <ul className={list}>
          <li>IP address.</li>
          <li>Browser type and device information.</li>
          <li>Operating system.</li>
          <li>Pages visited and website interactions.</li>
          <li>Approximate location derived from technical information.</li>
          <li>Website performance and diagnostic information.</li>
        </ul>

        <h3 className={subheading}>Marketing and referral information</h3>
        <p>
          Where applicable, we may collect information relating to advertising
          interactions, campaign performance, promotional activities, referral
          links and purchases attributed to authorised marketing campaigns or
          promoters.
        </p>
        <p>
          We aim to collect information that is reasonably relevant to the
          purposes for which it is processed.
        </p>
      </PolicySection>

      <PolicySection id="use" title="2. How We Use Your Information">
        <p>
          FINASTO™ may process personal information for legitimate business
          and operational purposes, including:
        </p>
        <ul className={list}>
          <li>Processing, confirming and fulfilling customer orders.</li>
          <li>Managing payments, refunds and delivery arrangements.</li>
          <li>
            Sending order confirmations, tracking updates and service
            notifications.
          </li>
          <li>Managing customer accounts and preferences.</li>
          <li>Providing customer support and handling enquiries.</li>
          <li>
            Preventing fraud, unauthorised transactions and misuse of our
            services.
          </li>
          <li>Protecting our website, systems and business operations.</li>
          <li>
            Analysing website performance and improving our products and
            services.
          </li>
          <li>Measuring advertising performance and promotional campaigns.</li>
          <li>
            Sending marketing communications where permitted by applicable law.
          </li>
          <li>
            Maintaining business, accounting, tax and transaction records.
          </li>
          <li>Complying with legal and regulatory obligations.</li>
          <li>
            Establishing, exercising or defending legal rights and legitimate
            business interests.
          </li>
        </ul>
        <p>
          We will not knowingly process personal information for purposes
          incompatible with those communicated to you, unless otherwise
          permitted by applicable law.
        </p>
      </PolicySection>

      <PolicySection id="legal-basis" title="3. Legal Basis for Processing">
        <p>
          Depending on the nature of the activity, FINASTO™ may process
          personal information on one or more lawful grounds, including:
        </p>
        <ul className={list}>
          <li>Your valid consent.</li>
          <li>Performance of a purchase, account or service agreement.</li>
          <li>Compliance with applicable legal obligations.</li>
          <li>Protection of vital interests, where applicable.</li>
          <li>
            Other legitimate interests, provided the processing is necessary
            and appropriately balanced against applicable privacy requirements.
          </li>
        </ul>
        <p>
          Where processing requires consent, we will seek that consent in the
          legally required manner. Consent for optional marketing or
          advertising activities will be handled separately where required.
        </p>
      </PolicySection>

      <PolicySection id="cookies" title="4. Cookies and Similar Technologies">
        <p>
          Our website may use cookies, pixels, tags and similar technologies to
          maintain website functionality, improve customer experience and
          understand how visitors interact with our services.
        </p>
        <p>These technologies may be used to:</p>
        <ul className={list}>
          <li>Maintain shopping carts and essential website functions.</li>
          <li>Remember preferences, region and currency.</li>
          <li>Support website security.</li>
          <li>Analyse website traffic and performance.</li>
          <li>Measure advertising and marketing effectiveness.</li>
          <li>Attribute purchases to promotional or referral links.</li>
          <li>Support relevant advertising campaigns.</li>
        </ul>

        <h3 className={subheading}>Advertising and analytics technologies</h3>
        <p>
          Where enabled, we may use third-party technologies, including Meta
          advertising technologies such as Meta Pixel and similar services
          provided by advertising and analytics platforms.
        </p>
        <p>
          These technologies may collect information such as IP addresses,
          device identifiers, browser information, website activity, page
          visits and certain purchase-related events.
        </p>
        <p>
          Such information may be used to measure campaign performance,
          understand customer interactions, improve advertising and support
          relevant promotional activities.
        </p>
        <p>
          Non-essential advertising and analytics technologies will be used
          subject to applicable consent requirements and available cookie
          preferences.
        </p>
        <p>
          You may manage cookie preferences through available website controls
          or your browser settings. Disabling certain cookies may affect some
          website features.
        </p>

        <h3 className={subheading}>Referral and promotional cookies</h3>
        <p>
          Where our referral programme uses tracking cookies, we may use them
          to attribute qualifying purchases to authorised promotional links.
          The applicable tracking period and attribution method will depend on
          the programme settings communicated to participants.
        </p>

        <div>
          <CookieSettingsButton />
        </div>
      </PolicySection>

      <PolicySection id="marketing" title="5. Marketing Communications">
        <p>
          FINASTO™ may use contact information to send product announcements,
          promotional offers, special campaigns and other marketing
          communications where permitted by applicable law.
        </p>
        <p>
          Where consent is required, we will obtain it before sending
          marketing communications.
        </p>
        <p>
          Customers may unsubscribe from promotional emails at any time through
          the unsubscribe option provided in the email or by contacting our
          team.
        </p>
        <p>
          Unsubscribing from promotional communications does not prevent
          FINASTO™ from sending essential service messages relating to orders,
          payments, deliveries, account security or other necessary business
          communications.
        </p>
      </PolicySection>

      <PolicySection id="sharing" title="6. Sharing of Personal Information">
        <p>FINASTO™ does not sell customers’ personal information.</p>
        <p>
          We may share relevant information with trusted third-party service
          providers where reasonably necessary to operate our website and
          business, including:
        </p>
        <ul className={list}>
          <li>
            <strong className={strong}>Payment service providers:</strong> for
            payment processing, transaction verification, refunds and fraud
            prevention.
          </li>
          <li>
            <strong className={strong}>Shipping and delivery providers:</strong>{" "}
            for order fulfilment, delivery arrangements and shipment tracking.
          </li>
          <li>
            <strong className={strong}>
              Website hosting and technology providers:
            </strong>{" "}
            for website hosting, maintenance, security, technical support and
            system operations.
          </li>
          <li>
            <strong className={strong}>
              Email and communication providers:
            </strong>{" "}
            for order notifications, customer service and permitted marketing
            communications.
          </li>
          <li>
            <strong className={strong}>
              Advertising and analytics providers:
            </strong>{" "}
            where enabled and legally permitted, for website analytics,
            advertising measurement, campaign optimisation and promotional
            activities, including services operated by Meta.
          </li>
          <li>
            <strong className={strong}>
              Professional and business service providers:
            </strong>{" "}
            for accounting, auditing, legal, technical and other legitimate
            business support services.
          </li>
          <li>
            <strong className={strong}>
              Legal and regulatory authorities:
            </strong>{" "}
            where disclosure is required by law, a valid legal request, court
            order or competent authority, or where reasonably necessary to
            protect FINASTO™’s legal rights, customers or business operations.
          </li>
        </ul>
        <p>
          We take reasonable steps to ensure that service providers handling
          personal information on our behalf are subject to appropriate
          confidentiality, security and data protection obligations.
        </p>
        <p>
          Third parties may also process information independently under their
          own privacy policies and applicable legal obligations.
        </p>
      </PolicySection>

      <PolicySection id="transfers" title="7. International Data Transfers">
        <p>
          FINASTO™ operates in Indonesia and may use international technology
          platforms, payment services, hosting providers and other business
          service providers.
        </p>
        <p>
          Consequently, personal information may be transferred to, stored or
          processed in countries outside Indonesia where necessary for the
          services described in this Policy.
        </p>
        <p>
          Where international transfers occur, FINASTO™ will take the measures
          required under applicable data protection laws, including
          appropriate safeguards and protection arrangements where necessary.
        </p>
      </PolicySection>

      <PolicySection id="retention" title="8. Data Retention">
        <p>
          FINASTO™ retains personal information only for as long as reasonably
          necessary for the purposes for which it was collected, including:
        </p>
        <ul className={list}>
          <li>Processing and fulfilling orders.</li>
          <li>Maintaining transaction, tax and accounting records.</li>
          <li>Managing customer accounts and communications.</li>
          <li>Handling complaints, disputes and claims.</li>
          <li>Preventing fraud and protecting business operations.</li>
          <li>Meeting legal and regulatory obligations.</li>
        </ul>
        <p>
          Retention periods may vary depending on the type of information, the
          purpose of processing and applicable legal requirements.
        </p>
        <p>
          When information is no longer required, FINASTO™ will take
          reasonable steps to delete, destroy or anonymise it, unless
          continued retention is required or permitted by law or necessary for
          the establishment, exercise or defence of legal claims.
        </p>
      </PolicySection>

      <PolicySection id="security" title="9. Data Security and Protection">
        <p>
          FINASTO™ implements reasonable technical and organisational measures
          designed to protect personal information against unauthorised
          access, disclosure, alteration, loss, misuse or destruction.
        </p>
        <p>These measures may include:</p>
        <ul className={list}>
          <li>Access restrictions and authorisation controls.</li>
          <li>Secure hosting and system management.</li>
          <li>Encryption where appropriate.</li>
          <li>Authentication and account security measures.</li>
          <li>Monitoring and other reasonable security procedures.</li>
        </ul>
        <p>
          Access to personal information is restricted to authorised personnel
          and service providers who require it for legitimate business
          purposes.
        </p>
        <p>
          Although we take reasonable precautions, no electronic transmission,
          website or storage system can be guaranteed to be completely secure.
          FINASTO™ therefore cannot guarantee absolute protection against
          every possible cyberattack, system failure or unauthorised activity.
        </p>
        <p>
          In the event of a personal data protection failure, FINASTO™ will
          investigate, take appropriate corrective measures and provide
          notifications as required by applicable law.
        </p>
      </PolicySection>

      <PolicySection
        id="requests"
        title="10. Personal Information Enquiries and Requests"
      >
        <p>
          Customers may contact FINASTO™ regarding questions, concerns or
          requests relating to the processing of their personal information.
        </p>
        <p>
          Depending on applicable law and the circumstances, requests may
          concern access to, correction of, deletion of or restrictions on the
          processing of personal information, or withdrawal of consent where
          processing is based on consent.
        </p>
        <p>
          To protect customer information, FINASTO™ may require reasonable
          identity verification before responding to a request.
        </p>
        <p>
          Certain information may need to be retained where required by law,
          necessary to complete a transaction or required for the
          establishment, exercise or defence of legal claims.
        </p>
        <p>
          Requests will be reviewed and handled in accordance with applicable
          legal requirements. FINASTO™ may decline or limit requests where
          legally permitted or where fulfilment would conflict with legal
          obligations or the rights of other parties.
        </p>
        {/* <p>
          To make a request, use our{" "}
          <Link href={PRIVACY_REQUEST_HREF} className={linkClass}>
            privacy request form
          </Link>
          .
        </p> */}
      </PolicySection>

      <PolicySection
        id="third-party"
        title="11. Third-Party Websites and Services"
      >
        <p>
          Our website may contain links to external websites, social media
          platforms, payment services or other third-party services.
        </p>
        <p>
          FINASTO™ does not control independent third-party websites or their
          privacy practices, security procedures or content.
        </p>
        <p>
          Any information provided directly to a third party will be subject to
          that party’s applicable terms and privacy policy.
        </p>
        <p>
          Customers are encouraged to review the relevant privacy policies
          before providing personal information to external services.
        </p>
      </PolicySection>

      <PolicySection id="children" title="12. Children’s Privacy">
        <p>Our website and services are not directed at children.</p>
        <p>
          We do not knowingly collect personal information from children
          without the required consent of a parent or legal guardian where
          applicable law requires such consent.
        </p>
        <p>
          If we become aware that personal information has been collected from
          a child without the required consent, we will take appropriate steps
          to address the matter in accordance with applicable law.
        </p>
      </PolicySection>

      <PolicySection id="changes" title="13. Changes to This Privacy Policy">
        <p>
          FINASTO™ reserves the right to update, revise or amend this Privacy
          Policy from time to time to reflect changes in our business
          operations, website features, technology, service providers or
          applicable legal requirements.
        </p>
        <p>
          Updated versions will be published on this page together with a
          revised date.
        </p>
        <p>
          Where required by applicable law, we will provide notice or obtain
          consent before implementing material changes affecting personal
          information processing.
        </p>
        <p>Customers are encouraged to review this page periodically.</p>
      </PolicySection>

      <PolicySection id="contact" title="14. Privacy Enquiries">
        <p>
          For questions, concerns or requests relating to this Privacy Policy
          or the processing of personal information, please contact the
          FINASTO™ Privacy Team through our{" "}
          <Link href="/contact" className={linkClass}>
            contact page.
          </Link>{" "}
          {/* or the{" "}
          <Link href={PRIVACY_REQUEST_HREF} className={linkClass}>
            privacy request form
          </Link>
          . */}
        </p>
        <p>
          Please provide sufficient information to help us identify and review
          your enquiry. We may request reasonable identity verification before
          responding to requests involving personal information.
        </p>
        <p>
          See also our{" "}
          <Link href="/terms" className={linkClass}>
            Terms of Service
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