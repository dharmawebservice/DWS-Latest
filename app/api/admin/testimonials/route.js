import { NextResponse } from "next/server";
import {
  auth, unauthorized, bad, readJson, clip, clipOrNull, toInt, dbError, refreshSite,
} from "../_util";

function build(body, partial) {
  const out = {};
  const has = (k) => body[k] !== undefined;
  if (!partial || has("name")) {
    const name = clip(body.name, 120);
    if (!name) return { error: "Name is required" };
    out.name = name;
  }
  if (!partial || has("text")) {
    const text = clip(body.text, 2000);
    if (!text) return { error: "Quote is required" };
    out.text = text;
  }
  if (has("role")) out.role = clipOrNull(body.role, 120);
  if (has("display_order")) out.display_order = toInt(body.display_order);
  if (has("active")) out.active = body.active === true;
  return { out };
}

export async function GET() {
  const supabase = await auth();
  if (!supabase) return unauthorized();
  const { data, error } = await supabase
    .from("testimonials").select("*").order("display_order").order("created_at");
  if (error) return dbError(error);
  return NextResponse.json(data ?? []);
}

export async function POST(req) {
  const supabase = await auth();
  if (!supabase) return unauthorized();
  const body = await readJson(req);
  if (!body) return bad("Invalid JSON body");
  const { out, error: verr } = build(body, false);
  if (verr) return bad(verr);
  const { data, error } = await supabase.from("testimonials").insert([out]).select().single();
  if (error) return dbError(error);
  refreshSite();
  return NextResponse.json(data);
}

export async function PATCH(req) {
  const supabase = await auth();
  if (!supabase) return unauthorized();
  const body = await readJson(req);
  if (!body) return bad("Invalid JSON body");
  if (!body.id) return bad("id is required");
  const { out, error: verr } = build(body, true);
  if (verr) return bad(verr);
  if (Object.keys(out).length === 0) return bad("Nothing to update");
  const { data, error } = await supabase.from("testimonials").update(out).eq("id", body.id).select().single();
  if (error) return dbError(error);
  refreshSite();
  return NextResponse.json(data);
}

export async function DELETE(req) {
  const supabase = await auth();
  if (!supabase) return unauthorized();
  const body = await readJson(req);
  if (!body?.id) return bad("id is required");
  const { error } = await supabase.from("testimonials").delete().eq("id", body.id);
  if (error) return dbError(error);
  refreshSite();
  return NextResponse.json({ ok: true });
}
