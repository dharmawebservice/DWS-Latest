import { NextResponse, after } from "next/server";
import { getServiceClient } from "../../../../lib/supabase";
import { sendMail, rowsToHtml } from "../../../../lib/mail";
import { rateLimit, clientIp } from "../../../../lib/ratelimit";
import { ALLOWED, answersToRows } from "../../../onboard/fields";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN = /^[A-Za-z0-9_-]{16,64}$/;
const clip = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const pick = (v, allowed) => (typeof v === "string" && allowed.includes(v) ? v : "");
const pickMany = (v, allowed) =>
  Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === "string" && allowed.includes(x)))] : [];

const INVALID = () =>
  NextResponse.json({ error: "This link is not valid, has expired, or was already used." }, { status: 404 });

export async function POST(req, { params }) {
  try {
    if (!rateLimit(`onboard:${clientIp(req)}`, { limit: 10, windowMs: 10 * 60 * 1000 })) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const { token } = await params;
    if (typeof token !== "string" || !TOKEN.test(token)) return INVALID();

    let body;
    try { body = await req.json(); } catch { body = null; }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Honeypot — pretend success
    if (clip(body.company_site, 200)) return NextResponse.json({ ok: true });

    const supabase = getServiceClient();
    const { data: row, error: rowErr } = await supabase
      .from("onboarding")
      .select("id, client_name, package_name, status, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (rowErr) {
      console.error("Onboard lookup error:", rowErr.message);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    if (!row || row.status !== "pending") return INVALID();
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return INVALID();

    const refs = (Array.isArray(body.references) ? body.references : [])
      .map((r) => clip(r, 300)).filter(Boolean).slice(0, 3);
    const deadline = clip(body.deadline, 10);

    const answers = {
      business_name: clip(body.business_name, 150),
      contact_person: clip(body.contact_person, 120),
      email: clip(body.email, 200),
      phone: clip(body.phone, 40),
      existing_website: clip(body.existing_website, 300),
      business_description: clip(body.business_description, 2000),
      target_audience: clip(body.target_audience, 1000),
      goals: pickMany(body.goals, ALLOWED.goals),
      pages: pickMany(body.pages, ALLOWED.pages),
      features: pickMany(body.features, ALLOWED.features),
      other_details: clip(body.other_details, 1000),
      style_notes: clip(body.style_notes, 1000),
      logo_status: pick(body.logo_status, ALLOWED.logo_status),
      content_status: pick(body.content_status, ALLOWED.content_status),
      domain_status: pick(body.domain_status, ALLOWED.domain_status),
      domain_name: clip(body.domain_name, 150),
      references: refs,
      deadline: /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? deadline : "",
      budget: pick(body.budget, ALLOWED.budget),
      notes: clip(body.notes, 2000),
    };

    const fields = {};
    if (!answers.business_name) fields.business_name = "Please enter your business name";
    if (!answers.contact_person) fields.contact_person = "Please enter a contact person";
    if (!EMAIL.test(answers.email)) fields.email = "Please enter a valid email";
    if (answers.phone.replace(/\D/g, "").length < 7) fields.phone = "Please enter a valid phone / WhatsApp number";
    if (!answers.business_description) fields.business_description = "Please tell us a little about the business";
    if (Object.keys(fields).length) {
      return NextResponse.json({ error: "Please fix the highlighted fields.", fields }, { status: 400 });
    }

    // Only succeeds if still pending (guards against double submits)
    const { data: updated, error: upErr } = await supabase
      .from("onboarding")
      .update({ answers, status: "submitted", submitted_at: new Date().toISOString() })
      .eq("id", row.id)
      .eq("status", "pending")
      .select("id");

    if (upErr) {
      console.error("Onboard save error:", upErr.message);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    if (!updated?.length) return INVALID();

    after(async () => {
      try {
        const rows = answersToRows(answers);
        const subject = `Onboarding submitted: ${answers.business_name}`;
        const text = [
          subject,
          `Link created for: ${row.client_name}${row.package_name ? ` (${row.package_name})` : ""}`,
          "",
          ...rows.map(([k, v]) => `${k}: ${v}`),
          "",
          "Open Dharma Vault → Onboarding",
        ].join("\n");
        const html = rowsToHtml(subject, [
          ["Link for", `${row.client_name}${row.package_name ? ` (${row.package_name})` : ""}`],
          ...rows,
          ["", "Open Dharma Vault → Onboarding"],
        ]);
        await sendMail({ subject, text, html, replyTo: answers.email });
      } catch (e) {
        console.error("Onboard mail error:", e?.message || e);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Onboard API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
