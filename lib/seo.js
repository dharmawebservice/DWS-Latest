import { SITE } from "./content";

// Per-page metadata helper: unique title/description, canonical, social tags.
export function pageMeta({ title, description, path = "/", absoluteTitle = false, type = "website", images, noindex = false }) {
  const full = absoluteTitle ? title : `${title} | ${SITE.name}`;
  const meta = {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title: full, description, url: path, siteName: SITE.name, type, locale: "en_IN", ...(images ? { images } : {}) },
    twitter: { card: "summary_large_image", title: full, description },
  };
  if (noindex) meta.robots = { index: false, follow: false };
  return meta;
}

export const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  alternateName: SITE.short,
  url: SITE.url,
  logo: `${SITE.url}/logo.png`,
  image: `${SITE.url}/opengraph-image`,
  email: SITE.email,
  telephone: SITE.phoneTel,
  address: { "@type": "PostalAddress", addressLocality: "Bangalore", addressCountry: "IN" },
  areaServed: ["IN", "GB", "AE", "US"],
  sameAs: [SITE.x, SITE.instagram],
  description: "Fast, premium websites, online stores and web apps for growing businesses.",
};

export const breadcrumbLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: `${SITE.url}${it.path}`,
  })),
});
