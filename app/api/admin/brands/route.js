import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../lib/auth";
import { getServiceClient } from "../../../../lib/supabase";
import { clipOrNull, isMissingSchema, MIGRATION_HINT, refreshSite } from "../_util";

async function auth() {
  const session = await getAdminSession();
  if (!session) return null;
  return getServiceClient();
}

const OPTIONAL_TEXT = { category: 120, summary: 500, result: 500, case_study: 20000, image_url: 1000, tags: 300 };

// Normalises optional work-page fields. Empty -> null (clears), undefined -> omitted.
function workFields(body, { omitEmpty }) {
  const out = {};
  for (const [key, max] of Object.entries(OPTIONAL_TEXT)) {
    if (body[key] === undefined) continue;
    let val = clipOrNull(body[key], max);
    if (key === "tags" && val) {
      val = val.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 12).join(", ").slice(0, max) || null;
    }
    if (omitEmpty && val === null) continue;
    out[key] = val;
  }
  if (body.featured !== undefined && (!omitEmpty || body.featured === true)) out.featured = body.featured === true;
  return out;
}

function failure(error) {
  if (isMissingSchema(error))
    return NextResponse.json({ error: MIGRATION_HINT, migration: true }, { status: 500 });
  return NextResponse.json({ error: error.message }, { status: 500 });
}

// ─── GET all brands (admin sees all, including inactive) ───────────────────
export async function GET() {
  const supabase = await auth();
  if (!supabase)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("display_order");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// ─── POST create brand (supports JSON body with logo_url string) ───────────
export async function POST(req) {
  const supabase = await auth();
  if (!supabase)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { body = null; }
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  // Basic validation
  if (typeof body.name !== "string" || !body.name.trim())
    return NextResponse.json({ error: "Brand name is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("brands")
    .insert([
      {
        name: body.name.trim().slice(0, 120),
        logo_url: body.logo_url ?? null,
        website_url: body.website_url ?? null,
        active: body.active ?? true,
        display_order: Number.isFinite(Number(body.display_order)) ? Number(body.display_order) : 0,
        ...workFields(body, { omitEmpty: true }),
      },
    ])
    .select()
    .single();

  if (error) return failure(error);
  refreshSite();
  return NextResponse.json(data);
}

// ─── PATCH update brand ────────────────────────────────────────────────────
export async function PATCH(req) {
  const supabase = await auth();
  if (!supabase)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { body = null; }
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const { id } = body;
  if (!id)
    return NextResponse.json({ error: "id is required" }, { status: 400 });

  // Whitelist — never pass arbitrary columns through
  const updates = {};
  if (typeof body.name === "string") {
    if (!body.name.trim())
      return NextResponse.json({ error: "Brand name cannot be empty" }, { status: 400 });
    updates.name = body.name.trim().slice(0, 120);
  }
  if (typeof body.logo_url === "string") updates.logo_url = body.logo_url.trim().slice(0, 1000);
  if (typeof body.website_url === "string") updates.website_url = body.website_url.trim().slice(0, 1000);
  if (typeof body.active === "boolean") updates.active = body.active;
  if (body.display_order !== undefined && Number.isFinite(Number(body.display_order)))
    updates.display_order = Number(body.display_order);
  Object.assign(updates, workFields(body, { omitEmpty: false }));

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const { data, error } = await supabase
    .from("brands")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return failure(error);
  refreshSite();
  return NextResponse.json(data);
}

// ─── DELETE brand (also removes logo from storage if it's a Supabase URL) ──
export async function DELETE(req) {
  const supabase = await auth();
  if (!supabase)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { body = null; }
  const id = body?.id;
  if (!id)
    return NextResponse.json({ error: "id is required" }, { status: 400 });

  // Fetch brand first so we can clean up storage
  const { data: brand } = await supabase
    .from("brands")
    .select("logo_url")
    .eq("id", id)
    .single();

  // If logo is stored in our Supabase bucket, delete the file too
  if (brand?.logo_url) {
    const supabaseStorageHost = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (brand.logo_url.includes(supabaseStorageHost)) {
      // Extract path after /brand-logos/
      const match = brand.logo_url.match(/brand-logos\/(.+)$/);
      if (match?.[1]) {
        await supabase.storage.from("brand-logos").remove([match[1]]);
      }
    }
  }

  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  refreshSite();
  return NextResponse.json({ ok: true });
}