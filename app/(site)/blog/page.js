import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { pageMeta, breadcrumbLd } from "@/lib/seo";
import JsonLd from "../../components/JsonLd";
import PageHero from "../../components/PageHero";
import CtaBand from "../../components/CtaBand";

export const metadata = pageMeta({
  title: "Blog — Practical Website Advice",
  description:
    "Plain-English guides from Dharma Web Services on website costs, speed, choosing the right site and launching without mistakes.",
  path: "/blog",
});

const fmt = (d) => new Date(d + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])} />
      <PageHero
        eyebrow="Blog"
        title={<>Practical advice, <em>no jargon.</em></>}
        intro="Short, useful guides for business owners who want a website that works."
        crumbs={[{ label: "Blog" }]}
      />
      <section className="section" aria-label="Articles">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="card card-hover reveal group flex flex-col p-8">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-gold-ink">{p.category}</p>
              <h2 className="mt-3 font-display text-[1.9rem] leading-tight">{p.title}</h2>
              <p className="mt-3 flex-1 text-[0.95rem] text-ink-2">{p.description}</p>
              <p className="mt-6 flex items-center justify-between text-sm text-mute">
                <span>{fmt(p.date)} · {p.readMinutes} min read</span>
                <ArrowUpRight size={18} className="transition-colors group-hover:text-ink" aria-hidden="true" />
              </p>
            </Link>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
