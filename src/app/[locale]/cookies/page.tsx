"use client";

import { useTranslations } from "next-intl";
import LegalPage from "@/components/LegalPage";

export default function CookiePolicyPage() {
  const t = useTranslations("cookies");

  return (
    <LegalPage title={t("title")} lastUpdated={t("lastUpdated")}>
      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">1. What Are Cookies</h2>
        <p>
          Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners useful information. This Cookie Policy explains how NOVA AI DEVELOPMENT SRL (&quot;NOVA,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses cookies and similar tracking technologies on our website, in compliance with the EU ePrivacy Directive (2002/58/EC as amended by 2009/136/EC) and the General Data Protection Regulation (GDPR).
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">2. Types of Cookies We Use</h2>
        
        <h3 className="text-[16px] font-medium text-white/80 mt-6 mb-3">2.1 Strictly Necessary Cookies</h3>
        <p>
          These cookies are essential for the website to function properly. They enable core functionality such as security, session management, and accessibility. You cannot opt out of these cookies as they are necessary for the website to operate. These cookies do not collect personal data for marketing purposes.
        </p>

        <h3 className="text-[16px] font-medium text-white/80 mt-6 mb-3">2.2 Performance and Analytics Cookies</h3>
        <p>
          These cookies collect information about how visitors use our website, such as which pages are visited most often and if users receive error messages. All information collected by these cookies is aggregated and therefore anonymous. They help us improve how our website works. We use these cookies only with your explicit consent.
        </p>

        <h3 className="text-[16px] font-medium text-white/80 mt-6 mb-3">2.3 Functional Cookies</h3>
        <p>
          These cookies allow the website to remember choices you make (such as your preferred language or the region you are in) and provide enhanced, more personalized features. They may be set by us or by third-party providers whose services we have added to our pages. These cookies are activated only with your consent.
        </p>

        <h3 className="text-[16px] font-medium text-white/80 mt-6 mb-3">2.4 Marketing and Targeting Cookies</h3>
        <p>
          These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites. They are based on uniquely identifying your browser and device. We do not currently use marketing cookies, but if we introduce them in the future, they will only be activated with your explicit consent.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">3. Specific Cookies We Use</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-white/50 mt-4">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-4 text-white/70 font-medium">Cookie Name</th>
                <th className="text-left py-3 pr-4 text-white/70 font-medium">Purpose</th>
                <th className="text-left py-3 pr-4 text-white/70 font-medium">Duration</th>
                <th className="text-left py-3 text-white/70 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4 text-white/60">NEXT_LOCALE</td>
                <td className="py-3 pr-4">Stores your preferred language setting</td>
                <td className="py-3 pr-4">1 year</td>
                <td className="py-3">Necessary</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4 text-white/60">session_id</td>
                <td className="py-3 pr-4">Maintains your session state</td>
                <td className="py-3 pr-4">Session</td>
                <td className="py-3">Necessary</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4 text-white/60">cookie_consent</td>
                <td className="py-3 pr-4">Records your cookie preferences</td>
                <td className="py-3 pr-4">1 year</td>
                <td className="py-3">Necessary</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">4. Your Consent and Choices</h2>
        <p>
          When you first visit our website, we present a cookie consent banner that allows you to accept or reject non-essential cookies. You can change your cookie preferences at any time. Strictly necessary cookies cannot be disabled as they are required for the website to function.
        </p>
        <p className="mt-4">
          You can also control cookies through your browser settings. Most browsers allow you to: view what cookies are stored and delete them individually; block third-party cookies; block all cookies; delete all cookies when you close the browser. Please note that blocking all cookies may impact your experience on our website and other websites you visit. If you disable cookies, some features and services on our site may not function properly.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">5. Third-Party Cookies</h2>
        <p>
          Some cookies on our website are placed by third-party services that appear on our pages. We do not control these third-party cookies. The relevant third party is responsible for these cookies, and you should refer to their privacy policies for more information. Third-party services we may use include: hosting providers (Vercel), analytics services (if enabled with your consent), and payment processors for project invoicing.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">6. Similar Technologies</h2>
        <p>
          In addition to cookies, we may use similar technologies such as: web beacons (pixel tags) to track email opens and website interactions; local storage (localStorage/sessionStorage) to store preferences locally on your device; fingerprinting techniques for fraud prevention purposes only. These technologies are subject to the same consent requirements as cookies where applicable.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">7. Data Protection Rights</h2>
        <p>
          Information collected through cookies may constitute personal data under the GDPR. Your rights regarding this data are outlined in our Privacy Policy, including your rights to access, rectification, erasure, restriction, data portability, and objection. For detailed information about your data protection rights, please refer to our <span className="text-white/80">Privacy Policy</span>.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">8. Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in technology, legislation, our business operations, or data practices. Any material changes will be posted on this page with an updated &quot;Last updated&quot; date. We encourage you to review this policy periodically.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">9. Contact Us</h2>
        <p>
          If you have questions about our use of cookies or this Cookie Policy, please contact:<br />
          <span className="text-white/80">NOVA AI DEVELOPMENT SRL — Data Protection</span><br />
          Email: privacy@nova.dev<br />
          DPO: dpo@nova.dev
        </p>
      </section>
    </LegalPage>
  );
}
