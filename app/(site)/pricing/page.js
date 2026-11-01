import Link from "next/link";
import { getPackages } from "@/lib/data";
import { FAQS, REASONS } from "@/lib/content";
import { pageMeta, breadcrumbLd } from "@/lib/seo";
import JsonLd from "../../components/JsonLd";
import PageHero from "../../components/PageHero";
import PackageCards from "../../components/PackageCards";
import SectionHead from "../../components/SectionHead";
import ServiceIcon from "../../components/ServiceIcon";
import Faq from "../../components/Faq";
import CtaBand from "../../components/CtaBand";

export const revalidate = 300;

export const metadata = pageMeta({
  title: "Website Pricing — Packages from ₹2,499",
  description:
    "Simple, one-time website packages with no subscriptions or hidden charges. Starter, Pro and Business plans from Dharma Web Services. You own everything.",
  path: "/pricing",
});

const PRICING_FAQ_Q = [
  "Do I need to pay anything upfront?",
  "Will I own the website and code?",
  "What if I'm not happy with the design?",
  "Do you provide hosting?",
  "How long does it take to build my website?",
];

export default async function PricingPage() {
  const plans = await getPackages();
  const faqs = FAQS.filter((f) => PRICING_FAQ_Q.includes(f.q));

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Website packages",
          itemListElement: plans.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: { "@type": "Offer", name: p.name, description: p.desc, price: String(p.price), priceCurrency: "INR" },
          })),
        }}
      />
      <PageHero
        eyebrow="Pricing"
        title={<>Simple, <em>transparent</em> pricing.</>}
        intro="One-time payment. No subscriptions. No hidden charges. You own everything we build."
        crumbs={[{ label: "Pricing" }]}
      />

      <section className="section" aria-label="Packages">
        <div className="container-x">
          <h2 className="sr-only">Packages</h2>
          <PackageCards plans={plans} />
          <p className="mt-14 text-center text-sm text-mute">
            Prices are in Indian rupees (INR). Need something that isn&apos;t listed?{" "}
            <Link href="/contact" className="link-underline font-medium text-ink">Ask for a custom quote</Link>.
          </p>
        </div>
      </section>

      <section className="section border-y border-line bg-sand" aria-labelledby="incl-h">
        <div className="container-x">
          <SectionHead center eyebrow="Every project" title={<span id="incl-h">Always <em>included</em></span>} />
          <ul className="mt-14 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {REASONS.map((r) => (
              <li key={r.title} className="reveal flex gap-4">
                <ServiceIcon name={r.icon} size={18} />
                <div>
                  <h3 className="text-[1.02rem] font-semibold text-ink">{r.title}</h3>
                  <p className="mt-1.5 text-[0.93rem] text-ink-2">{r.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-h">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4"><SectionHead eyebrow="FAQ" title={<span id="faq-h">Pricing <em>questions</em></span>} /></div>
          <div className="lg:col-span-8"><Faq items={faqs} /></div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
