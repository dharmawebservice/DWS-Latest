import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../lib/auth";
import { getServiceClient } from "../../../../lib/supabase";
import { isMissingSchema, MIGRATION_HINT } from "../_util";

async function auth() {
  const session = await getAdminSession();
  if (!session) return null;
  return getServiceClient();
}

const STATUSES = ["unread", "read", "replied"];

function failure(error) {
  if (isMissingSchema(error))
    return NextResponse.json({ error: MIGRATION_HINT, migration: true }, { status: 500 });
  return NextResponse.json({ error: error.message }, { status: 500 });
}

export async function GET() {
  const supabase = await auth();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req) {
  const supabase = await auth();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { body = null; }
  if (!body || typeof body !== "object" || !body.id)
    return NextResponse.json({ error: "id is required" }, { status: 400 });

  const updates = {};
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    updates.status = body.status;
  }
  if (body.notes !== undefined) {
    updates.notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) || null : null;
  }
  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const { data, error } = await supabase
    .from("messages")
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return failure(error);
  return NextResponse.json(data);
}

export async function DELETE(req) {
  const supabase = await auth();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { body = null; }
  if (!body?.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase.from("messages").delete().eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
