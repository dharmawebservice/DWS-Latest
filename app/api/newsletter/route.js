import { NextResponse } from "next/server";
import { getServiceClient } from "../../../lib/supabase";
import { rateLimit, clientIp } from "../../../lib/ratelimit";

export async function POST(req) {
  try {
    if (!rateLimit(`news:${clientIp(req)}`, { limit: 5, windowMs: 10 * 60 * 1000 })) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = getServiceClient();
    await supabase.from("newsletter").upsert([{ email }], { onConflict: "email" });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Newsletter API error:", err);
    return NextResponse.json({ ok: true }); // Silent fail — don't block UX
  }
}
