"use client";

import { useTranslations } from "next-intl";
import LegalPage from "@/components/LegalPage";

export default function TermsPage() {
  const t = useTranslations("terms");

  return (
    <LegalPage title={t("title")} lastUpdated={t("lastUpdated")}>
      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">1. Agreement to Terms</h2>
        <p>
          By accessing or using the website, applications, or services provided by NOVA AI DEVELOPMENT SRL (&quot;NOVA,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not use our services. These terms constitute a legally binding agreement between you and NOVA AI DEVELOPMENT SRL.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">2. Description of Services</h2>
        <p>
          NOVA provides AI-assisted software development services, including but not limited to: AI-powered project scoping and requirements extraction, custom software development, web and mobile application development, technical consulting, and related professional services. Our AI Agent is a tool that assists in structuring project requirements and does not replace professional judgment or decision-making.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">3. User Obligations</h2>
        <p>
          By using our services, you represent and warrant that: (a) you are at least 18 years of age; (b) you have the legal capacity to enter into binding agreements; (c) all information you provide is accurate, current, and complete; (d) you will not use our services for any unlawful purpose or in violation of any applicable laws or regulations; (e) you will not attempt to reverse-engineer, decompile, or disassemble any of our proprietary technology; (f) you will not use automated systems or software to extract data from our website without our prior written consent.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">4. Intellectual Property</h2>
        <p>
          All content on the NOVA website, including but not limited to text, graphics, logos, icons, images, audio clips, software, and the compilation thereof, is the exclusive property of NOVA AI DEVELOPMENT SRL and is protected by international copyright, trademark, and other intellectual property laws. The NOVA name, logo, and all related marks are trademarks of NOVA AI DEVELOPMENT SRL. You may not use, reproduce, distribute, or create derivative works from any of our content without our express written permission.
        </p>
        <p className="mt-4">
          Upon full payment and completion of a project, intellectual property rights for the custom software developed specifically for you will be transferred to you as outlined in the applicable project agreement. Pre-existing libraries, frameworks, tools, and proprietary methodologies used by NOVA remain the property of NOVA AI DEVELOPMENT SRL.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">5. Project Agreements and Payments</h2>
        <p>
          Individual software development projects are governed by separate project agreements (Scope of Work) that detail specific deliverables, timelines, payment terms, and conditions. All fees quoted are exclusive of applicable taxes unless otherwise stated. Payment terms are net 30 days from invoice date unless otherwise agreed in writing. Late payments may incur interest at a rate of 1.5% per month or the maximum rate permitted by law, whichever is lower. NOVA reserves the right to suspend work on any project with outstanding payments exceeding 15 days past due.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">6. AI Agent and Automated Systems</h2>
        <p>
          The NOVA AI Agent is a proprietary tool designed to assist with project scoping and requirements gathering. You acknowledge that: (a) the AI Agent provides suggestions and structured output based on your input, and such output should be reviewed by qualified professionals; (b) the AI Agent does not constitute professional advice in any field including but not limited to legal, financial, or medical domains; (c) NOVA does not guarantee the accuracy, completeness, or suitability of AI-generated output; (d) conversations with the AI Agent may be recorded and analyzed to improve our services, subject to our Privacy Policy.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">7. Confidentiality</h2>
        <p>
          Both parties agree to maintain the confidentiality of all proprietary or confidential information disclosed during the course of the relationship. This includes, without limitation, business plans, technical data, product ideas, trade secrets, and any other information designated as confidential. This obligation survives termination of any agreement for a period of five (5) years. Confidentiality obligations do not apply to information that: (a) is or becomes publicly available through no fault of the receiving party; (b) was rightfully known to the receiving party prior to disclosure; (c) is independently developed without use of the disclosing party&apos;s confidential information; (d) is required to be disclosed by law or court order.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">8. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NOVA AI DEVELOPMENT SRL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, BUSINESS OPPORTUNITIES, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR YOUR USE OF OUR SERVICES, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY, EVEN IF NOVA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p className="mt-4">
          NOVA&apos;s total aggregate liability arising out of or relating to these terms or your use of our services shall not exceed the total amount paid by you to NOVA in the twelve (12) months preceding the event giving rise to the claim.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">9. Warranties and Disclaimers</h2>
        <p>
          NOVA warrants that all services will be performed in a professional and workmanlike manner consistent with generally accepted industry standards. Except for this express warranty, our services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. NOVA does not warrant that the services will be uninterrupted, error-free, or completely secure.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">10. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless NOVA AI DEVELOPMENT SRL, its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from or relating to: (a) your use of our services; (b) your violation of these terms; (c) your violation of any rights of any third party; (d) any content or data you submit through our services.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">11. Termination</h2>
        <p>
          Either party may terminate the service relationship by providing thirty (30) days written notice. NOVA reserves the right to immediately suspend or terminate access to our services if you breach any provision of these terms. Upon termination: (a) all outstanding payments become immediately due; (b) you must cease using all NOVA services and intellectual property; (c) provisions that by their nature should survive termination shall survive, including but not limited to confidentiality, limitation of liability, and indemnification.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">12. Governing Law and Dispute Resolution</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of Romania, without regard to its conflict of law provisions. Any dispute arising from or relating to these terms shall first be attempted to be resolved through good-faith negotiation between the parties. If negotiation fails, disputes shall be submitted to the exclusive jurisdiction of the courts of Bucharest, Romania. Notwithstanding the foregoing, NOVA may seek injunctive or equitable relief in any court of competent jurisdiction.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">13. Modifications</h2>
        <p>
          NOVA reserves the right to modify these Terms at any time. We will notify users of material changes by posting the updated terms on our website with a new &quot;Last updated&quot; date. Your continued use of our services after any such modifications constitutes your acceptance of the revised terms. If you do not agree to the modified terms, you must stop using our services.
        </p>
      </section>

      <section>
        <h2 className="text-[20px] font-medium text-white mb-4">14. Contact Information</h2>
        <p>
          For any questions regarding these Terms and Conditions, please contact us at:<br />
          <span className="text-white/80">NOVA AI DEVELOPMENT SRL</span><br />
          Email: legal@nova.dev
        </p>
      </section>
    </LegalPage>
  );
}
