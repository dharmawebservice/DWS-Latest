import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth, unauthorized, bad, readJson, clip, clipOrNull, dbError } from "../_util";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const newToken = () => randomBytes(24).toString("base64url"); // 32 url-safe chars
const expiry = (days) => new Date(Date.now() + days * 86400000).toISOString();
const clampDays = (d) => {
  const n = Math.trunc(Number(d));
  return Number.isFinite(n) ? Math.min(90, Math.max(1, n)) : 14;
};

export async function GET() {
  const supabase = await auth();
  if (!supabase) return unauthorized();
  const { data, error } = await supabase
    .from("onboarding").select("*").order("created_at", { ascending: false });
  if (error) return dbError(error);
  return NextResponse.json(data ?? []);
}

export async function POST(req) {
  const supabase = await auth();
  if (!supabase) return unauthorized();
  const body = await readJson(req);
  if (!body) return bad("Invalid JSON body");

  const client_name = clip(body.client_name, 120);
  if (!client_name) return bad("Client name is required");
  const client_email = clip(body.client_email, 200);
  if (client_email && !EMAIL.test(client_email)) return bad("Client email looks invalid");
  const days = clampDays(body.days ?? 14);

  const { data, error } = await supabase
    .from("onboarding")
    .insert([{
      token: newToken(),
      client_name,
      client_email: client_email || null,
      package_name: clipOrNull(body.package_name, 120),
      status: "pending",
      expires_at: expiry(days),
    }])
    .select()
    .single();
  if (error) return dbError(error);
  return NextResponse.json(data);
}

export async function PATCH(req) {
  const supabase = await auth();
  if (!supabase) return unauthorized();
  const body = await readJson(req);
  if (!body) return bad("Invalid JSON body");
  if (!body.id) return bad("id is required");
  if (body.regenerate !== true) return bad("Nothing to update");

  const days = clampDays(body.days ?? 14);
  const { data, error } = await supabase
    .from("onboarding")
    .update({ token: newToken(), expires_at: expiry(days), status: "pending", submitted_at: null })
    .eq("id", body.id)
    .select()
    .single();
  if (error) return dbError(error);
  return NextResponse.json(data);
}

export async function DELETE(req) {
  const supabase = await auth();
  if (!supabase) return unauthorized();
  const body = await readJson(req);
  if (!body?.id) return bad("id is required");
  const { error } = await supabase.from("onboarding").delete().eq("id", body.id);
  if (error) return dbError(error);
  return NextResponse.json({ ok: true });
}
