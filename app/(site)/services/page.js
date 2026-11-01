import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SERVICES, REASONS } from "@/lib/content";
import { pageMeta, breadcrumbLd } from "@/lib/seo";
import JsonLd from "../../components/JsonLd";
import PageHero from "../../components/PageHero";
import ServiceIcon from "../../components/ServiceIcon";
import SectionHead from "../../components/SectionHead";
import CtaBand from "../../components/CtaBand";

export const metadata = pageMeta({
  title: "Website, Web App & E-commerce Services",
  description:
    "Business websites, custom web apps, online stores and SEO care — designed and built in Hyderabad by Dharma Web Services. Fast, mobile-first and fairly priced.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])} />
      <PageHero
        eyebrow="Services"
        title={<>Everything you need to <em>grow online.</em></>}
        intro="Four focused services, delivered by one small studio. Start with what you need today and add more as you grow."
        crumbs={[{ label: "Services" }]}
      />

      <section className="section" aria-label="Services">
        <div className="container-x space-y-6">
          {SERVICES.map((s, i) => (
            <article key={s.slug} className="card reveal grid gap-8 p-7 sm:p-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <ServiceIcon name={s.icon} />
                <p className="num-serif mt-5 text-sm text-mute">0{i + 1}</p>
                <h2 className="display-md mt-1">{s.title}</h2>
                <p className="mt-4 text-[0.98rem] text-ink-2">{s.intro}</p>
                <Link href={`/services/${s.slug}`} className="btn btn-ghost mt-7">
                  Learn more<span className="sr-only"> about {s.title}</span> <ArrowRight size={16} className="arrow" aria-hidden="true" />
                </Link>
              </div>
              <ul className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-7">
                {s.includes.map((x) => (
                  <li key={x} className="flex items-start gap-3 text-[0.94rem] text-ink-2">
                    <Check size={16} strokeWidth={2.2} className="mt-1 shrink-0 text-gold-ink" aria-hidden="true" />
                    {x}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section border-y border-line bg-sand" aria-labelledby="every-h">
        <div className="container-x">
          <SectionHead center eyebrow="Included with every project" title={<span id="every-h">The <em>details</em> we never skip</span>} />
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
      <CtaBand />
    </>
  );
}
