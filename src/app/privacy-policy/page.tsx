import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection } from "@/components/shop/policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Finasto collects, uses and protects your personal information, and the choices you have.",
};

// EDIT BEFORE LAUNCH: replace the placeholders below (company name,
// retention periods, service providers) and have the final text reviewed
// by a lawyer for the countries you sell to.
const UPDATED = "October 2026";

const list = "list-disc space-y-1.5 pl-5 marker:text-copper";
const link = "font-medium text-copper underline-offset-4 hover:underline";

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      path="/privacy-policy"
      eyebrow="Legal"
      title="Privacy Policy"
      intro="We collect only what we need to process your order and run our store. This page explains what we collect, why, and your choices."
      updated={UPDATED}
    >
      <PolicySection id="collect" title="What we collect">
        <ul className={list}>
          <li>
            <strong className="font-medium text-espresso">Order details:</strong>{" "}
            name, email, phone, delivery and billing address, and the items you
            buy.
          </li>
          <li>
            <strong className="font-medium text-espresso">Account details:</strong>{" "}
            email and a secured password, if you create an account.
          </li>
          <li>
            <strong className="font-medium text-espresso">Usage data:</strong>{" "}
            device, browser, pages visited and approximate location, collected
            through cookies.
          </li>
        </ul>
        <p>
          We do not store your full card number. Payments are handled by our
          payment providers.
        </p>
      </PolicySection>

      <PolicySection id="use" title="How we use it">
        <ul className={list}>
          <li>To process, ship and support your orders.</li>
          <li>To send order confirmations and delivery updates.</li>
          <li>To prevent fraud and keep the store secure.</li>
          <li>To improve our products and website.</li>
          <li>To send marketing emails only if you agree. You can unsubscribe at any time.</li>
        </ul>
      </PolicySection>

      <PolicySection id="share" title="Who we share it with">
        <p>
          We share information only with service providers who help us run the
          store: payment processors, shipping carriers, hosting and email
          providers. They may use it only to provide their service to us. We do
          not sell your personal information.
        </p>
        <p>
          We may also share information when the law requires it, or to protect
          our rights and customers.
        </p>
      </PolicySection>

      <PolicySection id="cookies" title="Cookies and referral links">
        <p>
          We use cookies to keep your cart, remember your market and currency,
          and understand how the site is used. If you arrive through an
          affiliate&apos;s referral link, we store a cookie so the order can be
          credited to that affiliate. The first link you open is the one
          credited, for up to one year. You can block cookies in your browser,
          but parts of the store may stop working.
        </p>
      </PolicySection>

      <PolicySection id="retention" title="How long we keep it">
        <p>
          We keep order records for as long as needed for tax, accounting and
          legal reasons, and other data only as long as it is useful for the
          purposes above. Then we delete or anonymise it.
        </p>
      </PolicySection>

      <PolicySection id="rights" title="Your rights">
        <p>
          Depending on where you live, you can ask to see, correct, export or
          delete your personal information, object to or limit how we use it,
          and withdraw your consent at any time. To make a request,{" "}
          <Link href="/contact" className={link}>
            contact us
          </Link>
          . We reply within 30 days. If you are not satisfied, you may complain
          to your local data protection authority.
        </p>
      </PolicySection>

      <PolicySection id="security" title="Security and transfers">
        <p>
          We use encryption and access controls to protect your information. No
          system is completely secure, so we cannot guarantee absolute
          security. Your information may be processed in countries other than
          your own, and we use safeguards that protect it wherever it goes.
        </p>
      </PolicySection>

      <PolicySection id="children" title="Children">
        <p>
          Our store is not intended for children under 16, and we do not
          knowingly collect their information.
        </p>
      </PolicySection>

      <PolicySection id="changes" title="Changes and contact">
        <p>
          We may update this policy and will change the date at the top when we
          do. For questions about privacy,{" "}
          <Link href="/contact" className={link}>
            contact us
          </Link>
          . See also our{" "}
          <Link href="/terms" className={link}>
            Terms of Service
          </Link>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}