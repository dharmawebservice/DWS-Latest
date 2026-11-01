import LegalShell from "../../components/LegalShell";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/content";

export const metadata = pageMeta({
  title: "Privacy Policy",
  description: "How Dharma Web Services collects, uses and protects the personal information you share through our website and enquiry forms.",
  path: "/privacy",
});

export default function Privacy() {
  return (
    <LegalShell
      eyebrow="Legal"
      title={<>Privacy <em>policy</em></>}
      intro="A plain-language summary of what we collect, why, and the choices you have. Last updated 24 October 2026."
    >
      <div className="prose-dws">
        <h2>What we collect</h2>
        <h3>Information you give us</h3>
        <ul>
          <li><strong>Contact form:</strong> your name, email address, optional phone number, the service you are interested in, and your message.</li>
          <li><strong>Onboarding form:</strong> if we send you a private onboarding link, the project details you enter (business information, preferences and contact details). Please do not enter passwords.</li>
          <li><strong>Newsletter:</strong> your email address, if you subscribe.</li>
          <li><strong>WhatsApp or email:</strong> anything you choose to send us directly. WhatsApp is operated by Meta and is subject to its own privacy terms.</li>
        </ul>
        <h3>Information collected automatically</h3>
        <p>
          When you visit our public pages we record a simple visit log: your IP address, browser user-agent, the
          page you viewed and the date. We use it only to understand how many people visit and which pages are
          useful. We do not use advertising trackers or sell this data.
        </p>

        <h2>How we use it</h2>
        <ul>
          <li>To reply to your enquiry and provide a quote or service.</li>
          <li>To send occasional offers and web tips, if you subscribed — you can unsubscribe at any time by emailing us.</li>
          <li>To keep the site secure, fast and working properly.</li>
        </ul>

        <h2>Who we share it with</h2>
        <p>
          We do not sell your personal information. We use trusted providers to run the site: Supabase (database
          storage), Vercel (hosting) and an email delivery service that notifies us when you send an enquiry. They process data on our behalf under their own security and privacy
          commitments. We may disclose information if required by law.
        </p>

        <h2>Cookies</h2>
        <p>
          Our public website does not set advertising or tracking cookies. A single session cookie is used only
          for the private admin area that our team uses to manage the site.
        </p>

        <h2>Retention and your rights</h2>
        <p>
          We keep enquiries for as long as needed to respond and maintain a record of our business relationship,
          and visit logs for analytics. You can ask us to access, correct or delete the personal information we
          hold about you by emailing <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>

        <h2>Security</h2>
        <p>
          We use encrypted connections (HTTPS) and restrict access to stored data. No method of transmission or
          storage is perfectly secure, but we take reasonable steps to protect your information.
        </p>

        <h2>Changes</h2>
        <p>We may update this policy from time to time. The date at the top shows when it was last revised.</p>

        <h2>Contact</h2>
        <p>Questions about privacy? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </div>
    </LegalShell>
  );
}
