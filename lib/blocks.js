// Project-page content blocks.
//
// The Vault saves a project's extra page content as a list of "blocks" (a JSON array in
// brands.blocks). This file is pure JavaScript with no server-only imports, so the Vault API,
// the public data layer and the browser editor all share one set of rules and limits.
//
// Every block is cleaned here: unknown types are dropped, text is trimmed and clipped,
// image links must be https:// or a site path, and empty blocks are removed. Nothing
// from the database or the browser is ever rendered unchecked.

export const BLOCK_TYPES = ["text", "list", "stats", "gallery", "quote"];

export const LIMITS = {
  blocks: 20,
  heading: 120,
  body: 5000,
  listItems: 12,
  listItem: 140,
  stats: 6,
  statValue: 16,
  statLabel: 60,
  images: 12,
  caption: 140,
  quote: 600,
  person: 80,
  url: 1000,
};

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Only https links or paths on this site (plus http://localhost for a local Supabase while developing).
// Blocks javascript:, data:, other http: links and protocol-relative URLs.
export function safeImageUrl(v) {
  const s = str(v, LIMITS.url);
  if (/^https:\/\/[^\s]+$/i.test(s)) return s;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/[^\s]*$/i.test(s)) return s;
  if (/^\/(?!\/)[^\s]*$/.test(s)) return s;
  return "";
}

const cleanId = (v, fallback) => {
  const s = str(v, 40).replace(/[^a-zA-Z0-9_-]/g, "");
  return s || fallback;
};

function cleanBlock(b, i) {
  if (!b || typeof b !== "object") return null;
  const type = b.type;
  if (!BLOCK_TYPES.includes(type)) return null;
  const id = cleanId(b.id, `b${i}`);
  const heading = str(b.heading, LIMITS.heading);

  if (type === "text") {
    const body = str(b.body, LIMITS.body);
    if (!heading && !body) return null;
    return { id, type, heading, body };
  }

  if (type === "list") {
    const raw = Array.isArray(b.items) ? b.items : typeof b.items === "string" ? b.items.split("\n") : [];
    const items = raw.map((x) => str(x, LIMITS.listItem)).filter(Boolean).slice(0, LIMITS.listItems);
    if (!items.length) return null;
    return { id, type, heading, items };
  }

  if (type === "stats") {
    const raw = Array.isArray(b.items) ? b.items : [];
    const items = raw
      .map((x) => (x && typeof x === "object" ? { value: str(x.value, LIMITS.statValue), label: str(x.label, LIMITS.statLabel) } : null))
      .filter((x) => x && x.value)
      .slice(0, LIMITS.stats);
    if (!items.length) return null;
    return { id, type, heading, items };
  }

  if (type === "gallery") {
    const raw = Array.isArray(b.images) ? b.images : [];
    const images = raw
      .map((x) => (x && typeof x === "object" ? { url: safeImageUrl(x.url), caption: str(x.caption, LIMITS.caption) } : null))
      .filter((x) => x && x.url)
      .slice(0, LIMITS.images);
    if (!images.length) return null;
    return { id, type, heading, images };
  }

  // quote
  const text = str(b.text, LIMITS.quote);
  if (!text) return null;
  return { id, type, text, author: str(b.author, LIMITS.person), role: str(b.role, LIMITS.person) };
}

export function sanitizeBlocks(input) {
  let arr = input;
  if (typeof arr === "string") {
    try { arr = JSON.parse(arr); } catch { return []; }
  }
  if (!Array.isArray(arr)) return [];
  const out = [];
  const seen = new Set();
  for (let i = 0; i < arr.length && out.length < LIMITS.blocks; i++) {
    const b = cleanBlock(arr[i], i);
    if (!b) continue;
    // Keep ids unique so React keys never clash.
    while (seen.has(b.id)) b.id = `${b.id}x`;
    seen.add(b.id);
    out.push(b);
  }
  return out;
}

// Storage paths (inside the brand-logos bucket) used by a project's images, so deleting the
// project can also remove its uploaded files. Only URLs that point at the given Supabase host count.
export function storagePathsFrom(urls, supabaseUrl) {
  if (!supabaseUrl) return [];
  const base = `${String(supabaseUrl).replace(/\/$/, "")}/storage/v1/object/public/brand-logos/`;
  const paths = [];
  for (const u of urls) {
    if (typeof u === "string" && u.startsWith(base)) {
      const p = decodeURIComponent(u.slice(base.length).split("?")[0]);
      if (p && !p.includes("..")) paths.push(p);
    }
  }
  return [...new Set(paths)];
}
