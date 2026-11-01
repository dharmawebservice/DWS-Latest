// Server component: renders structured data for search engines.
export default function JsonLd({ data }) {
  // "<" is escaped so content can never close the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
