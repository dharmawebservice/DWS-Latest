import { Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "@/lib/content";
import { getServiceOptions } from "@/lib/data";
import { pageMeta, breadcrumbLd } from "@/lib/seo";
import JsonLd from "../../components/JsonLd";
import PageHero from "../../components/PageHero";
import ContactForm from "../../components/ContactForm";

export const revalidate = 300;

export const metadata = pageMeta({
  title: "Contact — Start Your Project",
  description:
    "Tell Dharma Web Services about your website or web app. Message us on WhatsApp, email or use the form — we reply with a clear plan, timeline and price.",
  path: "/contact",
});

export default async function ContactPage() {
  const options = await getServiceOptions();

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Dharma Web Services",
          url: `${SITE.url}/contact`,
        }}
      />
      <PageHero
        eyebrow="Contact"
        title={<>Let&apos;s build <em>something great.</em></>}
        intro="Tell us what you have in mind. We reply with a clear plan, timeline and price — no obligation."
        crumbs={[{ label: "Contact" }]}
      />

      <section className="section" aria-label="Contact">
        <div className="container-x grid items-start gap-10 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-5">
            <ul className="space-y-5">
              <li className="flex gap-4">
                <span className="icon-tile"><Mail size={18} aria-hidden="true" /></span>
                <div><p className="text-sm text-mute">Email</p><a href={`mailto:${SITE.email}`} className="break-all font-medium text-ink hover:text-gold-ink">{SITE.email}</a></div>
              </li>
              <li className="flex gap-4">
                <span className="icon-tile"><Phone size={18} aria-hidden="true" /></span>
                <div><p className="text-sm text-mute">Phone & WhatsApp</p><a href={`tel:${SITE.phoneTel}`} className="font-medium text-ink hover:text-gold-ink">{SITE.phoneDisplay}</a></div>
              </li>
              <li className="flex gap-4">
                <span className="icon-tile"><MapPin size={18} aria-hidden="true" /></span>
                <div><p className="text-sm text-mute">Studio</p><p className="font-medium text-ink">{SITE.city}</p><p className="text-sm text-mute">Working with clients worldwide</p></div>
              </li>
            </ul>

            <a href={SITE.whatsappHello} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-lg mt-9 w-full sm:w-auto">
              Chat on WhatsApp
            </a>
            <div className="panel mt-9 p-6">
              <p className="font-display text-[1.4rem] text-ink">What happens next?</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink-2">
                <li>We read your message and reply.</li>
                <li>A short discovery call to understand your goals.</li>
                <li>You get a written scope, timeline and fixed price.</li>
              </ol>
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-7"><ContactForm serviceOptions={options} /></div>
        </div>
      </section>
    </>
  );
}
