import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { STEPS } from "@/lib/content";
import { pageMeta, breadcrumbLd } from "@/lib/seo";
import JsonLd from "../../components/JsonLd";
import PageHero from "../../components/PageHero";
import Steps from "../../components/Steps";
import SectionHead from "../../components/SectionHead";
import CtaBand from "../../components/CtaBand";

export const metadata = pageMeta({
  title: "Our Process — From First Call to Launch",
  description:
    "How a Dharma Web Services project works: discovery call, private onboarding, design preview, build, review and launch — usually in 7–14 days.",
  path: "/process",
});

export default function ProcessPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Process", path: "/process" }])} />
      <PageHero
        eyebrow="Process"
        title={<>A clear path from <em>idea to launch.</em></>}
        intro="Six simple steps, with no surprises. Most projects go live in 7–14 days."
        crumbs={[{ label: "Process" }]}
      />

      <section className="section" aria-label="Steps">
        <div className="container-x"><h2 className="sr-only">The six steps</h2><Steps steps={STEPS} detailed /></div>
      </section>

      <section className="section border-y border-line bg-sand" aria-labelledby="onb-h">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead eyebrow="Onboarding" title={<span id="onb-h">A private link, <em>just for you</em></span>} />
          </div>
          <div className="prose-dws blog lg:col-span-7">
            <p>
              Once we agree to work together, we send you a personal onboarding link. It opens a short form where you tell us
              about your business, pages, features, style and deadline — no account or password needed.
            </p>
            <p>
              The link is private, expires after a set time, and works once. Your answers go straight to us and nowhere else.
              Please don&apos;t put passwords in the form — we&apos;ll collect any access details securely in conversation.
            </p>
            <p>
              <Link href="/contact" className="inline-flex items-center gap-2 font-medium">Start the conversation <ArrowRight size={16} aria-hidden="true" /></Link>
            </p>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
