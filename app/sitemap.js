import { SITE, SERVICES } from "@/lib/content";
import { getAllPosts } from "@/lib/blog";
import { getWork } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap() {
  const now = new Date();
  const u = (path, priority, changeFrequency = "monthly", lastModified = now) => ({
    url: `${SITE.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });

  const work = (await getWork()).filter((w) => w.hasCase);

  return [
    u("", 1, "weekly"),
    u("/services", 0.9),
    ...SERVICES.map((s) => u(`/services/${s.slug}`, 0.8)),
    u("/work", 0.8, "weekly"),
    ...work.map((w) => u(`/work/${w.slug}`, 0.6)),
    u("/pricing", 0.8),
    u("/process", 0.6),
    u("/about", 0.6),
    u("/blog", 0.7, "weekly"),
    ...getAllPosts().map((p) => u(`/blog/${p.slug}`, 0.6, "yearly", new Date(p.updated || p.date))),
    u("/contact", 0.8),
    u("/privacy", 0.2, "yearly"),
    u("/terms", 0.2, "yearly"),
    u("/cookies", 0.2, "yearly"),
  ];
}
