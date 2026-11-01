import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getWork, getWorkBySlug } from "@/lib/data";
import { pageMeta, breadcrumbLd } from "@/lib/seo";
import JsonLd from "../../../components/JsonLd";
import PageHero from "../../../components/PageHero";
import WorkCard from "../../../components/WorkCard";
import CtaBand from "../../../components/CtaBand";

export const revalidate = 300;

export async function generateStaticParams() {
  const all = await getWork();
  return all.filter((w) => w.hasCase).map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const w = await getWorkBySlug(slug);
  if (!w || !w.hasCase) return { title: "Project not found", robots: { index: false, follow: false } };
  return pageMeta({
    title: `${w.name} — ${w.category || "Project"} Case Study`,
    description: w.summary.slice(0, 158),
    path: `/work/${w.slug}`,
  });
}

export default async function CaseStudy({ params }) {
  const { slug } = await params;
  const [w, all] = await Promise.all([getWorkBySlug(slug), getWork()]);
  if (!w || !w.hasCase) notFound();
  const more = all.filter((x) => x.hasCase && x.image && x.slug !== w.slug).slice(0, 3);
  const paragraphs = w.caseStudy ? w.caseStudy.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : [];

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }, { name: w.name, path: `/work/${w.slug}` }])} />
      <PageHero
        eyebrow={w.category || "Project"}
        title={w.name}
        intro={w.summary}
        crumbs={[{ label: "Work", href: "/work" }, { label: w.name }]}
      >
        {w.url && (
          <a href={w.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
            Visit live site <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        )}
      </PageHero>

      <section className="section" aria-label="Case study">
        <div className="container-x">
          {w.image && (
            <div className="card overflow-hidden shadow-lift">
              <div className="relative aspect-[16/9] bg-sand">
                <Image src={w.image} alt={`${w.name} website screenshot`} fill priority sizes="(min-width:1200px) 1136px, 100vw" className="object-cover object-top" />
              </div>
            </div>
          )}

          <div className="mt-14 grid gap-12 lg:grid-cols-12">
            <div className="prose-dws blog lg:col-span-8">
              <h2 className="!mt-0">About the project</h2>
              <p>{w.summary}</p>
              {w.result && (<><h2>Result</h2><p>{w.result}</p></>)}
              {paragraphs.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
            </div>
            <aside className="lg:col-span-4">
              <div className="card p-7 text-sm">
                <dl className="space-y-5">
                  {w.category && (<div><dt className="font-semibold text-ink">Category</dt><dd className="mt-1 text-ink-2">{w.category}</dd></div>)}
                  {w.tags.length > 0 && (
                    <div>
                      <dt className="font-semibold text-ink">Built with</dt>
                      <dd className="mt-2"><ul className="flex flex-wrap gap-1.5">{w.tags.map((t) => <li key={t} className="chip">{t}</li>)}</ul></dd>
                    </div>
                  )}
                </dl>
                <Link href="/contact" className="btn btn-primary mt-7 w-full">Start a similar project <ArrowRight size={16} className="arrow" aria-hidden="true" /></Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section className="section-tight border-t border-line" aria-label="More projects">
          <div className="container-x">
            <h2 className="eyebrow">More work</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {more.map((x) => <WorkCard key={x.id} w={x} />)}
            </div>
          </div>
        </section>
      )}
      <CtaBand />
    </>
  );
}
