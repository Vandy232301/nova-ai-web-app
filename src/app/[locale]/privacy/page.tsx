"use client";

import { useTranslations } from "next-intl";
import LegalPage from "@/components/LegalPage";

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <LegalPage title={t("title")} lastUpdated={t("lastUpdated")}>
      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">1. Introduction</h2>
        <p>
          NOVA AI DEVELOPMENT SRL (&quot;NOVA,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data when you use our website, AI Agent, and services. We process personal data in compliance with the General Data Protection Regulation (GDPR — EU Regulation 2016/679), the Romanian Data Protection Law (Law 190/2018), and other applicable data protection legislation.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">2. Data Controller</h2>
        <p>
          The data controller responsible for your personal data is:<br />
          <span className="text-white/80">NOVA AI DEVELOPMENT SRL</span><br />
          Email: privacy@nova.dev<br /><br />
          If you have any questions about how we handle your personal data, you can contact our Data Protection Officer at dpo@nova.dev.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">3. Data We Collect</h2>
        <p className="mb-4">We collect the following categories of personal data:</p>
        <p>
          <span className="text-white/80 font-medium">Identity Data:</span> Name, job title, company name, provided when you contact us or use our services.
        </p>
        <p className="mt-2">
          <span className="text-white/80 font-medium">Contact Data:</span> Email address, phone number, provided when you schedule a call, send us a message, or create an account.
        </p>
        <p className="mt-2">
          <span className="text-white/80 font-medium">Technical Data:</span> IP address, browser type and version, operating system, device information, time zone setting, and other technology identifiers collected automatically when you visit our website.
        </p>
        <p className="mt-2">
          <span className="text-white/80 font-medium">Usage Data:</span> Information about how you use our website and services, including pages visited, time spent, click patterns, and features used.
        </p>
        <p className="mt-2">
          <span className="text-white/80 font-medium">AI Interaction Data:</span> Content of conversations with our AI Agent, including project descriptions, requirements, and any other information you voluntarily provide during the AI-assisted scoping process.
        </p>
        <p className="mt-2">
          <span className="text-white/80 font-medium">Transaction Data:</span> Payment information, invoicing details, and transaction history related to our services.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">4. Legal Basis for Processing</h2>
        <p className="mb-4">We process your personal data based on the following legal grounds under GDPR Article 6:</p>
        <p>
          <span className="text-white/80 font-medium">Contract Performance (Art. 6(1)(b)):</span> Processing necessary for the performance of a contract to which you are a party, or to take pre-contractual steps at your request. This includes processing data to deliver our software development services and manage project agreements.
        </p>
        <p className="mt-2">
          <span className="text-white/80 font-medium">Legitimate Interests (Art. 6(1)(f)):</span> Processing necessary for our legitimate interests, including improving our services, ensuring security, preventing fraud, and conducting business analytics, provided these interests are not overridden by your fundamental rights and freedoms.
        </p>
        <p className="mt-2">
          <span className="text-white/80 font-medium">Consent (Art. 6(1)(a)):</span> Where you have given explicit consent for specific processing activities, such as marketing communications or non-essential cookies. You may withdraw consent at any time.
        </p>
        <p className="mt-2">
          <span className="text-white/80 font-medium">Legal Obligation (Art. 6(1)(c)):</span> Processing necessary for compliance with legal obligations to which we are subject, including tax, accounting, and regulatory requirements.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">5. How We Use Your Data</h2>
        <p>
          We use your personal data to: provide and maintain our services; process and complete transactions; communicate with you about projects, updates, and support; operate and improve our AI Agent and technology; analyze usage patterns to improve user experience; comply with legal obligations; protect our rights, privacy, safety, or property; send marketing communications (only with your explicit consent); prevent fraud and ensure the security of our services.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">6. Data Sharing and Transfers</h2>
        <p>
          We do not sell your personal data. We may share your data with: trusted service providers who assist us in operating our business (hosting providers, analytics services, payment processors), subject to appropriate data processing agreements; professional advisors (lawyers, accountants) bound by professional secrecy obligations; law enforcement or regulatory authorities when required by law; successors in interest in the event of a merger, acquisition, or restructuring.
        </p>
        <p className="mt-4">
          If we transfer personal data outside the European Economic Area (EEA), we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) approved by the European Commission, adequacy decisions, or other legally recognized transfer mechanisms under GDPR Chapter V.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">7. Data Retention</h2>
        <p>
          We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, including legal, accounting, and reporting requirements. Specifically: project-related data is retained for 5 years after project completion; financial records are retained for 10 years as required by Romanian fiscal legislation; AI interaction logs are retained for 2 years for service improvement purposes; marketing consent records are retained until consent is withdrawn. When personal data is no longer needed, it is securely deleted or anonymized.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">8. Your Rights Under GDPR</h2>
        <p className="mb-4">Under the GDPR, you have the following rights regarding your personal data:</p>
        <p><span className="text-white/80 font-medium">Right of Access (Art. 15):</span> Request a copy of your personal data we hold.</p>
        <p className="mt-2"><span className="text-white/80 font-medium">Right to Rectification (Art. 16):</span> Request correction of inaccurate or incomplete data.</p>
        <p className="mt-2"><span className="text-white/80 font-medium">Right to Erasure (Art. 17):</span> Request deletion of your personal data (&quot;right to be forgotten&quot;).</p>
        <p className="mt-2"><span className="text-white/80 font-medium">Right to Restriction (Art. 18):</span> Request restriction of processing in certain circumstances.</p>
        <p className="mt-2"><span className="text-white/80 font-medium">Right to Data Portability (Art. 20):</span> Receive your data in a structured, machine-readable format.</p>
        <p className="mt-2"><span className="text-white/80 font-medium">Right to Object (Art. 21):</span> Object to processing based on legitimate interests or direct marketing.</p>
        <p className="mt-2"><span className="text-white/80 font-medium">Right to Withdraw Consent (Art. 7(3)):</span> Withdraw consent at any time, without affecting the lawfulness of prior processing.</p>
        <p className="mt-4">
          To exercise any of these rights, please contact us at privacy@nova.dev. We will respond within 30 days. You also have the right to lodge a complaint with the Romanian National Supervisory Authority for Personal Data Processing (ANSPDCP) at www.dataprotection.ro.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">9. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include: encryption of data in transit (TLS/SSL) and at rest; access controls and authentication mechanisms; regular security assessments and penetration testing; employee training on data protection; incident response procedures. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and, where appropriate, by email. We encourage you to review this policy periodically for any changes.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">11. Contact Us</h2>
        <p>
          For any questions or concerns about this Privacy Policy or our data practices, please contact:<br />
          <span className="text-white/80">NOVA AI DEVELOPMENT SRL — Data Protection</span><br />
          Email: privacy@nova.dev<br />
          DPO: dpo@nova.dev
        </p>
      </section>
    </LegalPage>
  );
}
