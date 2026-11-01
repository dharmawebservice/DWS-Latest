import { getWork } from "@/lib/data";
import { pageMeta, breadcrumbLd } from "@/lib/seo";
import JsonLd from "../../components/JsonLd";
import PageHero from "../../components/PageHero";
import WorkCard from "../../components/WorkCard";
import CtaBand from "../../components/CtaBand";

export const revalidate = 300;

export const metadata = pageMeta({
  title: "Our Work — Websites & Web Apps",
  description:
    "Real websites and web apps built by Dharma Web Services for clients in India and the UK — e-commerce, food, creative and construction businesses.",
  path: "/work",
});

export default async function WorkPage() {
  const work = await getWork();
  const withVisual = work.filter((w) => w.image);
  const logoOnly = work.filter((w) => !w.image);
  // Avoid an orphan card: 3 columns only when the count divides evenly.
  const cols = withVisual.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])} />
      <PageHero
        eyebrow="Work"
        title={<>Real projects for <em>real businesses.</em></>}
        intro="A selection of websites and web apps we have designed and built. Every one is live and every one belongs to its owner."
        crumbs={[{ label: "Work" }]}
      />

      <section className="section" aria-label="Projects">
        <div className="container-x">
          <h2 className="sr-only">Projects</h2>
          <div className={`grid gap-6 md:grid-cols-2 ${cols}`}>
            {withVisual.map((w, i) => <WorkCard key={w.id} w={w} priority={i < 3} />)}
          </div>

          {logoOnly.length > 0 && (
            <div className="mt-16">
              <h2 className="eyebrow">More clients</h2>
              <ul className={`mt-6 grid gap-6 md:grid-cols-2 ${cols}`}>
                {logoOnly.map((w) => (
                  <li key={w.id}>
                    <WorkCard w={w} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
      <CtaBand title={<>Want a site like <em>these?</em></>} />
    </>
  );
}
