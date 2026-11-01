import { SITE } from "@/lib/content";

// Private areas are protected by login/unguessable links and marked noindex.
// They are deliberately NOT listed here, because robots.txt is public.
export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/onboard/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
