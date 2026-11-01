import { NextResponse } from "next/server";
import { getServiceClient } from "../../../lib/supabase";
import { rateLimit, clientIp } from "../../../lib/ratelimit";
import { isBot } from "../../../lib/bots";
import { getAdminSession } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    // Cap junk traffic: 60 page views per minute per visitor is plenty.
    if (!rateLimit(`visit:${clientIp(req)}`, { limit: 60, windowMs: 60 * 1000 })) {
      return NextResponse.json({ ok: true });
    }
    // Count genuine visitors only: no bots/scripts, no prefetches, no cross-site posts,
    // and never the owner while logged in to the Vault.
    const ua = req.headers.get("user-agent") || "";
    if (isBot(ua)) return NextResponse.json({ ok: true });
    const purpose = `${req.headers.get("purpose") || ""}${req.headers.get("sec-purpose") || ""}`;
    if (/prefetch|prerender/i.test(purpose)) return NextResponse.json({ ok: true });
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      try { if (new URL(origin).host !== host) return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ ok: true }); }
    }
    if (await getAdminSession()) return NextResponse.json({ ok: true });
    const supabase = getServiceClient();
    const body = await req.json();
    const raw = typeof body?.page === "string" ? body.page.slice(0, 200) : "/";
    const page = raw.startsWith("/") ? raw : "/";

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const userAgent = (req.headers.get("user-agent") || "").slice(0, 300);
    const today = new Date().toISOString().split("T")[0];

    const { error: insertError } = await supabase
      .from("page_visits")
      .insert([
        {
          visitor_ip: ip,
          visit_date: today,
          page_path: page || "/",
          user_agent: userAgent,
          hit_count: 1,
        },
      ]);

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: existing } = await supabase
          .from("page_visits")
          .select("id, hit_count")
          .eq("visitor_ip", ip)
          .eq("visit_date", today)
          .eq("page_path", page || "/")
          .single();

        if (existing) {
          await supabase
            .from("page_visits")
            .update({ hit_count: (existing.hit_count || 1) + 1 })
            .eq("id", existing.id);
        }
      } else {
        console.error("Visit insert error:", insertError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Visit tracking error:", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}