import Image from "next/image";
import { Check, Quote } from "lucide-react";

// Extra sections of a project page, built in the Vault (Brands -> Page sections).
// Server component: blocks are already cleaned by lib/blocks.js before they get here.

const STAT_COLS = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-3",
  6: "lg:grid-cols-3",
};

function BlockHeading({ children }) {
  return (
    <>
      <span aria-hidden="true" className="mb-4 block h-px w-8 bg-gold" />
      <h2 className="font-display text-[1.75rem] font-normal leading-[1.12] tracking-tight text-ink sm:text-[2.1rem]">{children}</h2>
    </>
  );
}

const paragraphs = (s) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

function TextBlock({ b }) {
  return (
    <section className="section-tight border-t border-line">
      <div className="container-x grid gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">{b.heading && <BlockHeading>{b.heading}</BlockHeading>}</div>
        <div className="prose-dws blog lg:col-span-8">
          {paragraphs(b.body).map((p, i) => <p key={i} className={i === 0 ? "!mt-0" : ""}>{p}</p>)}
        </div>
      </div>
    </section>
  );
}

function ListBlock({ b }) {
  return (
    <section className="section-tight border-t border-line">
      <div className="container-x grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">{b.heading && <BlockHeading>{b.heading}</BlockHeading>}</div>
        <ul className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
          {b.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3.5 border-t border-line-2 py-4">
              <span className="icon-tile !h-7 !w-7 mt-0.5"><Check size={14} strokeWidth={2.4} aria-hidden="true" /></span>
              <span className="text-[1.02rem] leading-snug text-ink">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function StatsBlock({ b }) {
  return (
    <section className="surface section-tight border-y border-line">
      <div className="container-x">
        {b.heading && <h2 className="eyebrow mb-8">{b.heading}</h2>}
        <dl className={`grid grid-cols-2 gap-x-8 gap-y-10 ${STAT_COLS[b.items.length] || "lg:grid-cols-3"}`}>
          {b.items.map((s, i) => (
            <div key={i} className="border-t border-gold pt-5">
              <dd className="num-serif text-[2.4rem] leading-none text-ink sm:text-[3rem]">{s.value}</dd>
              {s.label && <dt className="mt-3 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-gold-ink">{s.label}</dt>}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function GalleryBlock({ b, name }) {
  const odd = b.images.length % 2 === 1;
  return (
    <section className="section-tight border-t border-line">
      <div className="container-x">
        {b.heading && <div className="mb-8 max-w-3xl"><BlockHeading>{b.heading}</BlockHeading></div>}
        <ul className="grid gap-6 sm:grid-cols-2">
          {b.images.map((img, i) => {
            const wide = odd && i === 0;
            return (
              <li key={`${img.url}-${i}`} className={wide ? "sm:col-span-2" : ""}>
                <figure>
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${img.caption || `${name} image ${i + 1}`} at full size`}
                    className="card relative block aspect-[16/10] overflow-hidden bg-sand"
                  >
                    <Image
                      src={img.url}
                      alt={img.caption || `${name} screenshot ${i + 1}`}
                      fill
                      quality={95}
                      sizes={wide ? "(min-width:1200px) 1136px, 100vw" : "(min-width:1200px) 556px, (min-width:640px) 50vw, 100vw"}
                      className="object-cover object-top"
                    />
                  </a>
                  {img.caption && <figcaption className="mt-3 text-sm text-mute">{img.caption}</figcaption>}
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function QuoteBlock({ b }) {
  return (
    <section className="section border-t border-line">
      <div className="container-x">
        <figure className="mx-auto max-w-3xl text-center">
          <span className="icon-tile mx-auto"><Quote size={18} aria-hidden="true" /></span>
          <blockquote className="mt-7 font-display text-[1.6rem] font-normal leading-snug text-ink sm:text-[2.1rem]">
            &ldquo;{b.text}&rdquo;
          </blockquote>
          {(b.author || b.role) && (
            <figcaption className="mt-7 text-sm">
              {b.author && <span className="font-semibold text-ink">{b.author}</span>}
              {b.author && b.role && <span className="text-mute"> · </span>}
              {b.role && <span className="text-mute">{b.role}</span>}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}

// The first text / list sections flow in the left column, right under "About the project" and
// beside the facts card, so that space is never empty. Everything from the first wide section
// (numbers, gallery, quote) onward is rendered full width by <ProjectBlocks>.
export function splitBlocks(blocks = []) {
  let n = 0;
  while (n < blocks.length && (blocks[n].type === "text" || blocks[n].type === "list")) n++;
  return { lead: blocks.slice(0, n), rest: blocks.slice(n) };
}

// Rendered inside the page's `.prose-dws` column.
export function LeadBlocks({ blocks = [] }) {
  return blocks.map((b) => (
    <div key={b.id}>
      {b.heading && <h2>{b.heading}</h2>}
      {b.type === "text" && paragraphs(b.body).map((p, i) => <p key={i}>{p}</p>)}
      {b.type === "list" && (
        <ul className="!m-0 !list-none !p-0 border-b border-line-2">
          {b.items.map((item, i) => (
            <li key={i} className="!m-0 flex items-start gap-3.5 border-t border-line-2 !px-0 !py-3.5">
              <span className="icon-tile !h-7 !w-7 mt-0.5"><Check size={14} strokeWidth={2.4} aria-hidden="true" /></span>
              <span className="!text-[1.02rem] leading-snug text-ink">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  ));
}

export default function ProjectBlocks({ blocks = [], name = "Project" }) {
  if (!blocks.length) return null;
  return (
    <div>
      {blocks.map((b) => {
        switch (b.type) {
          case "text": return <TextBlock key={b.id} b={b} />;
          case "list": return <ListBlock key={b.id} b={b} />;
          case "stats": return <StatsBlock key={b.id} b={b} />;
          case "gallery": return <GalleryBlock key={b.id} b={b} name={name} />;
          case "quote": return <QuoteBlock key={b.id} b={b} />;
          default: return null;
        }
      })}
    </div>
  );
}
