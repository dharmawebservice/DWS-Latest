import { NextResponse } from "next/server";
import { auth, unauthorized, bad, readJson, clip, dbError } from "../_util";

// Saved document projects (client + project details used to generate the Vault documents).
// `data` is a flat object of short strings/booleans; everything is clipped server-side.
function cleanData(v) {
  const out = {};
  if (!v || typeof v !== "object" || Array.isArray(v)) return out;
  for (const [k, val] of Object.entries(v).slice(0, 80)) {
    if (!/^[a-z0-9_]{1,40}$/i.test(k)) continue;
    if (typeof val === "boolean") out[k] = val;
    else if (typeof val === "number" && Number.isFinite(val)) out[k] = val;
    else if (typeof val === "string") out[k] = val.slice(0, 4000);
  }
  return out;
}

function build(body, partial) {
  const out = {};
  if (!partial || body.client_name !== undefined) {
    const n = clip(body.client_name, 160);
    if (!n) return { error: "Client name is required" };
    out.client_name = n;
  }
  if (body.project_name !== undefined) out.project_name = clip(body.project_name, 160) || null;
  if (body.data !== undefined) {
    out.data = cleanData(body.data);
    if (JSON.stringify(out.data).length > 40000) return { error: "Project details are too large" };
  }
  out.updated_at = new Date().toISOString();
  return { out };
}

export async function GET() {
  const supabase = await auth();
  if (!supabase) return unauthorized();
  const { data, error } = await supabase.from("doc_projects").select("*").order("updated_at", { ascending: false }).limit(200);
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
  const { data, error } = await supabase.from("doc_projects").insert([out]).select().single();
  if (error) return dbError(error);
  return NextResponse.json(data);
}

export async function PATCH(req) {
  const supabase = await auth();
  if (!supabase) return unauthorized();
  const body = await readJson(req);
  if (!body?.id) return bad("id is required");
  const { out, error: verr } = build(body, true);
  if (verr) return bad(verr);
  const { data, error } = await supabase.from("doc_projects").update(out).eq("id", body.id).select().single();
  if (error) return dbError(error);
  return NextResponse.json(data);
}

export async function DELETE(req) {
  const supabase = await auth();
  if (!supabase) return unauthorized();
  const body = await readJson(req);
  if (!body?.id) return bad("id is required");
  const { error } = await supabase.from("doc_projects").delete().eq("id", body.id);
  if (error) return dbError(error);
  return NextResponse.json({ ok: true });
}
