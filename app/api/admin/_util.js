// Shared helpers for admin API routes (underscore folder/file = not a route).
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "../../../lib/auth";
import { getServiceClient } from "../../../lib/supabase";

export async function auth() {
  const session = await getAdminSession();
  if (!session) return null;
  return getServiceClient();
}

export const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
export const bad = (error, status = 400) => NextResponse.json({ error }, { status });

export async function readJson(req) {
  try {
    const b = await req.json();
    return b && typeof b === "object" && !Array.isArray(b) ? b : null;
  } catch {
    return null;
  }
}

export const clip = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export const clipOrNull = (v, max) => clip(v, max) || null;

export function toInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(-100000, Math.min(100000, Math.trunc(n))) : fallback;
}

// Returns a finite number >= 0, or null when invalid/empty.
export function toMoney(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n < 1e9 ? n : null;
}

export function cleanFeatures(v) {
  const arr = Array.isArray(v) ? v : typeof v === "string" ? v.split("\n") : [];
  return arr
    .filter((x) => typeof x === "string")
    .map((x) => x.trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 20);
}

export const MIGRATION_HINT = "Database is missing new columns/tables. Run supabase-migration.sql in Supabase first.";

// Missing column (42703 / PGRST204) or missing table (42P01 / PGRST205)
export function isMissingSchema(e) {
  if (!e) return false;
  return (
    ["42703", "PGRST204", "42P01", "PGRST205"].includes(e.code) ||
    /does not exist|schema cache/i.test(e.message || "")
  );
}

export function dbError(e) {
  if (isMissingSchema(e)) return NextResponse.json({ error: MIGRATION_HINT, migration: true }, { status: 500 });
  console.error("Admin DB error:", e?.message || e);
  return NextResponse.json({ error: e?.message || "Database error" }, { status: 500 });
}

// Refresh the public site right after a successful write.
export function refreshSite() {
  try {
    revalidatePath("/", "layout");
  } catch (e) {
    console.error("revalidate failed:", e?.message || e);
  }
}
