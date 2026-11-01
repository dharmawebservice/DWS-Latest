import LegalShell from "../../components/LegalShell";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/content";

export const metadata = pageMeta({
  title: "Terms & Conditions",
  description: "The terms that apply when you hire Dharma Web Services: scope, payments, revisions, ownership, support and delivery of your website.",
  path: "/terms",
});

export default function Terms() {
  return (
    <LegalShell
      eyebrow="Legal"
      title={<>Terms of <em>service</em></>}
      intro="The simple ground rules for working together. Last updated 24 October 2026."
    >
      <div className="prose-dws">
        <h2>1. Our services</h2>
        <p>
          Dharma Web Services (“DWS”, “we”) provides website design, development, e-commerce, web application and
          related services. The scope, price and timeline for each project are agreed with you in writing —
          usually over WhatsApp or email — before work begins.
        </p>

        <h2>2. Payments</h2>
        <ul>
          <li>For most projects we take a 50% advance before starting, with the remaining 50% due on completion.</li>
          <li>For smaller projects at the Starter price, full payment is required upfront.</li>
          <li>Prices are one-time project fees. Third-party costs such as domains or paid hosting tiers are separate.</li>
          <li>Refunds are considered case by case. If you have a concern, contact us and we will work it out fairly.</li>
        </ul>

        <h2>3. Timelines</h2>
        <p>
          Typical delivery is 7–14 days; simple landing pages are often faster and complex stores or apps can take
          up to three weeks. Timelines are estimates and depend on you providing content, feedback and approvals promptly.
        </p>

        <h2>4. Revisions and support</h2>
        <p>
          The Starter plan includes three rounds of revisions. Pro and Business plans include revisions until you
          are satisfied, within the agreed scope. After launch we provide a period of free bug fixes and tweaks as
          described in your plan. Work outside the original scope may be quoted separately.
        </p>

        <h2>5. Ownership</h2>
        <p>
          Once final payment is received, the code, assets and deployed website created for you belong to you. We
          may display the finished project in our portfolio unless you ask us not to. We retain ownership of our
          pre-existing tools, libraries and know-how.
        </p>

        <h2>6. Your responsibilities</h2>
        <p>
          You confirm that you have the right to use all text, images, logos and other material you supply, and
          that it does not infringe anyone else&apos;s rights or break the law.
        </p>

        <h2>7. Hosting and third parties</h2>
        <p>
          We can set up hosting on platforms such as Vercel or Netlify. These services are run by third parties and
          are subject to their own terms and availability; we are not responsible for their outages or policy changes.
        </p>

        <h2>8. Liability</h2>
        <p>
          We work carefully and stand behind our work, but to the extent permitted by law our liability for any
          claim relating to a project is limited to the fees you paid us for that project. We are not liable for
          indirect or consequential losses such as lost profits.
        </p>

        <h2>9. Governing law</h2>
        <p>These terms are governed by the laws of India. Any dispute will be subject to the courts at Hyderabad, Telangana.</p>

        <h2>10. Contact</h2>
        <p>Questions about these terms? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </div>
    </LegalShell>
  );
}
