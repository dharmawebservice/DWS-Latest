// Server-side data access for the PUBLIC site.
// Every function is failure-safe: if Supabase is unreachable (or a table has
// not been created yet) the site falls back to built-in content instead of
// erroring. Pages that call these use ISR (`revalidate`) and the Vault calls
// revalidatePath after edits, so visitors never wait on the database.

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { PLANS_FALLBACK, WORK_FALLBACK, WORK_DEFAULTS } from "./content";

const TIMEOUT_MS = 8000;

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init = {}) => fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) }),
    },
  });
}

export function slugify(s = "") {
  return String(s)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const splitTags = (v) =>
  Array.isArray(v) ? v.filter(Boolean) : typeof v === "string" ? v.split(",").map((t) => t.trim()).filter(Boolean) : [];

/* ── Work (brands table) ─────────────────────────────────────── */
function normalizeBrand(row) {
  const slug = slugify(row.name);
  const d = WORK_DEFAULTS[slug] || {};
  const summary = (row.summary || "").trim() || d.summary || "";
  const tags = splitTags(row.tags);
  return {
    id: row.id,
    slug,
    name: row.name,
    logo: row.logo_url || row.logo || "",
    url: row.website_url || row.url || "",
    category: (row.category || "").trim() || d.category || "",
    summary,
    result: (row.result || "").trim(),
    caseStudy: (row.case_study || "").trim(),
    image: (row.image_url || "").trim() || d.image || "",
    tags: tags.length ? tags : d.tags || [],
    featured: !!row.featured,
    hasCase: !!summary,
  };
}

export const getWork = cache(async () => {
  try {
    const sb = client();
    if (sb) {
      const { data, error } = await sb
        .from("brands")
        .select("*")
        .eq("active", true)
        .order("display_order");
      if (!error && data && data.length) return data.map(normalizeBrand);
      if (error) console.error("[data] brands:", error.message);
    }
  } catch (err) {
    console.error("[data] brands failed:", err?.message || err);
  }
  return WORK_FALLBACK.map(normalizeBrand);
});

export async function getWorkBySlug(slug) {
  const all = await getWork();
  return all.find((w) => w.slug === slug) || null;
}

/* ── Packages ────────────────────────────────────────────────── */
function normalizePackage(row) {
  const price = Number(row.price) || 0;
  const original = row.original_price ? Number(row.original_price) : null;
  return {
    id: row.id,
    name: row.name,
    price,
    original: original && original > price ? original : null,
    badge: row.badge || null,
    desc: row.description || "",
    features: Array.isArray(row.features) ? row.features.filter(Boolean) : [],
    cta: row.cta || "Get started",
    popular: !!row.popular,
    service: (row.service_label || "").trim() || `${row.name} Package — ₹${price.toLocaleString("en-IN")}`,
  };
}

export const getPackages = cache(async () => {
  try {
    const sb = client();
    if (sb) {
      const { data, error } = await sb
        .from("packages")
        .select("*")
        .eq("active", true)
        .order("display_order");
      if (!error && data && data.length) return data.map(normalizePackage);
      if (error) console.error("[data] packages:", error.message);
    }
  } catch (err) {
    console.error("[data] packages failed:", err?.message || err);
  }
  return PLANS_FALLBACK;
});

/* ── Testimonials (real ones only; empty until added in the Vault) ── */
export const getTestimonials = cache(async () => {
  try {
    const sb = client();
    if (sb) {
      const { data, error } = await sb
        .from("testimonials")
        .select("id,name,role,text,display_order")
        .eq("active", true)
        .order("display_order");
      if (!error && data) return data;
      if (error) console.error("[data] testimonials:", error.message);
    }
  } catch (err) {
    console.error("[data] testimonials failed:", err?.message || err);
  }
  return [];
});

/* Options for the contact form's service dropdown. */
export async function getServiceOptions() {
  const plans = await getPackages();
  return [...plans.map((p) => p.service), "Custom / Not sure"];
}
