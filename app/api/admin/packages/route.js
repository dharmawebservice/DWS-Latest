import { NextResponse } from "next/server";
import {
  auth, unauthorized, bad, readJson, clip, clipOrNull, toInt, toMoney,
  cleanFeatures, dbError, refreshSite,
} from "../_util";

// Builds a validated column set. `partial` = PATCH (only touch provided keys).
function build(body, partial) {
  const out = {};
  const has = (k) => body[k] !== undefined;

  if (!partial || has("name")) {
    const name = clip(body.name, 120);
    if (!name) return { error: "Package name is required" };
    out.name = name;
  }
  if (!partial || has("price")) {
    const price = toMoney(body.price);
    if (price === null) return { error: "Price must be a number, 0 or more" };
    out.price = price;
  }
  if (has("original_price")) {
    const op = toMoney(body.original_price);
    if (body.original_price !== "" && body.original_price !== null && op === null)
      return { error: "Original price must be a number, 0 or more" };
    out.original_price = op;
  }
  if (has("badge")) out.badge = clipOrNull(body.badge, 60);
  if (has("description")) out.description = clipOrNull(body.description, 2000);
  if (has("features")) out.features = cleanFeatures(body.features);
  if (has("cta")) out.cta = clip(body.cta, 60) || "Get started";
  if (has("service_label")) out.service_label = clipOrNull(body.service_label, 120);
  if (has("display_order")) out.display_order = toInt(body.display_order);
  if (has("popular")) out.popular = body.popular === true;
  if (has("active")) out.active = body.active === true;
  return { out };
}

export async function GET() {
  const supabase = await auth();
  if (!supabase) return unauthorized();
  const { data, error } = await supabase
    .from("packages").select("*").order("display_order").order("created_at");
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

  const { data, error } = await supabase.from("packages").insert([out]).select().single();
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

  const { data, error } = await supabase.from("packages").update(out).eq("id", body.id).select().single();
  if (error) return dbError(error);
  refreshSite();
  return NextResponse.json(data);
}

export async function DELETE(req) {
  const supabase = await auth();
  if (!supabase) return unauthorized();
  const body = await readJson(req);
  if (!body?.id) return bad("id is required");
  const { error } = await supabase.from("packages").delete().eq("id", body.id);
  if (error) return dbError(error);
  refreshSite();
  return NextResponse.json({ ok: true });
}
