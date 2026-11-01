import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { SERVICES, SITE } from "@/lib/content";
import { getPackages } from "@/lib/data";
import { pageMeta, breadcrumbLd } from "@/lib/seo";
import JsonLd from "../../../components/JsonLd";
import PageHero from "../../../components/PageHero";
import SectionHead from "../../../components/SectionHead";
import Faq from "../../../components/Faq";
import CtaBand from "../../../components/CtaBand";

export const revalidate = 300;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return {};
  return pageMeta({
    title: `${s.title} in Bangalore`,
    description: `${s.tagline} ${s.short}`.slice(0, 158),
    path: `/services/${s.slug}`,
  });
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) notFound();
  const plans = await getPackages();
  const others = SERVICES.filter((x) => x.slug !== s.slug);
  const showPrices = s.slug !== "seo-and-maintenance";

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: s.title, path: `/services/${s.slug}` }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.title,
          description: s.intro,
          provider: { "@type": "ProfessionalService", name: SITE.name, url: SITE.url },
          areaServed: ["IN", "GB", "AE", "US"],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: s.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />

      <PageHero
        eyebrow="Service"
        title={s.title}
        intro={s.intro}
        crumbs={[{ label: "Services", href: "/services" }, { label: s.title }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/contact" className="btn btn-primary btn-lg">Get a quote <ArrowRight size={17} className="arrow" aria-hidden="true" /></Link>
          <Link href="/work" className="btn btn-ghost btn-lg">See our work</Link>
        </div>
      </PageHero>

      <section className="section" aria-labelledby="incl-h">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead eyebrow="What's included" title={<span id="incl-h">What you <em>get</em></span>} />
            <p className="mt-6 text-[0.98rem] text-ink-2"><strong className="text-ink">Who it&apos;s for: </strong>{s.forWho}</p>
            <ul className="mt-6 flex flex-wrap gap-2">{s.stack.map((t) => <li key={t} className="chip">{t}</li>)}</ul>
          </div>
          <ul className="card reveal grid content-start gap-4 p-7 sm:p-9 lg:col-span-7">
            {s.includes.map((x) => (
              <li key={x} className="flex items-start gap-3 text-[1rem] text-ink-2">
                <Check size={18} strokeWidth={2.2} className="mt-1 shrink-0 text-gold-ink" aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {showPrices && plans.length > 0 && (
        <section className="section-tight border-y border-line bg-sand" aria-labelledby="from-h">
          <div className="container-x flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow">Pricing</p>
              <h2 id="from-h" className="display-md mt-3">
                Packages start at <em>₹{Math.min(...plans.map((p) => p.price)).toLocaleString("en-IN")}</em>
              </h2>
              <p className="mt-2 text-ink-2">One-time payment, no subscriptions. Final price depends on scope.</p>
            </div>
            <Link href="/pricing" className="btn btn-primary btn-lg shrink-0">See packages <ArrowRight size={17} className="arrow" aria-hidden="true" /></Link>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="faq-h">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4"><SectionHead eyebrow="FAQ" title={<span id="faq-h">Common <em>questions</em></span>} /></div>
          <div className="lg:col-span-8"><Faq items={s.faqs} /></div>
        </div>
      </section>

      <section className="section-tight border-t border-line" aria-label="Other services">
        <div className="container-x">
          <h2 className="eyebrow">More services</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/services/${o.slug}`} className="card card-hover block p-6">
                  <h3 className="font-display text-[1.4rem] leading-tight">{o.title}</h3>
                  <p className="mt-2 text-sm text-ink-2">{o.tagline}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
