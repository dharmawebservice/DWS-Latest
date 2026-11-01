import PageHero from "./PageHero";

// Shared frame for the legal pages.
export default function LegalShell({ eyebrow, title, intro, path, children }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} crumbs={[{ label: eyebrow === "Legal" ? "Legal" : eyebrow }]} />
      <article className="section">
        <div className="container-narrow">{children}</div>
      </article>
    </>
  );
}
