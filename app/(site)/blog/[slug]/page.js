import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/lib/content";
import { getAllPosts, getPost } from "@/lib/blog";
import { pageMeta, breadcrumbLd } from "@/lib/seo";
import JsonLd from "../../../components/JsonLd";
import PageHero from "../../../components/PageHero";
import CtaBand from "../../../components/CtaBand";


export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return {
    ...pageMeta({ title: p.title, description: p.description, path: `/blog/${p.slug}`, type: "article" }),
    authors: [{ name: "Dharmendra" }],
  };
}

const fmt = (d) => new Date(d + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function Block({ b }) {
  switch (b.type) {
    case "h2": return <h2>{b.text}</h2>;
    case "ul": return <ul>{b.items.map((i) => <li key={i}>{i}</li>)}</ul>;
    case "ol": return <ol>{b.items.map((i) => <li key={i}>{i}</li>)}</ol>;
    case "callout": return <p className="callout">{b.text}</p>;
    default: return <p>{b.text}</p>;
  }
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const related = getAllPosts().filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.updated || post.date,
          author: { "@type": "Person", name: "Dharmendra", worksFor: { "@type": "Organization", name: SITE.name } },
          publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/logo.png` } },
          mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
        }}
      />
      <PageHero
        eyebrow={post.category}
        title={post.title}
        crumbs={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
      >
        <p className="text-sm text-mute">
          By Dharmendra, Dharma Web Services · <time dateTime={post.date}>{fmt(post.date)}</time> · {post.readMinutes} min read
        </p>
      </PageHero>

      <article className="section">
        <div className="container-narrow">
          <div className="prose-dws blog">
            <p className="!text-[1.15rem] !text-ink">{post.description}</p>
            {post.body.map((b, i) => <Block key={i} b={b} />)}
          </div>
          <div className="card mt-14 flex flex-col items-start justify-between gap-5 p-7 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-[1.5rem] text-ink">Need a hand with your website?</p>
              <p className="mt-1 text-sm text-ink-2">Tell us about your project and we&apos;ll reply with a clear plan.</p>
            </div>
            <Link href="/contact" className="btn btn-primary shrink-0">Get in touch <ArrowRight size={16} className="arrow" aria-hidden="true" /></Link>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section-tight border-t border-line" aria-label="More articles">
          <div className="container-x">
            <h2 className="eyebrow">Keep reading</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="card card-hover block p-7">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-gold-ink">{p.category}</p>
                  <h3 className="mt-2 font-display text-[1.6rem] leading-tight">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand />
    </>
  );
}
