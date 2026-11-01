import { NextResponse, after } from "next/server";
import { getServiceClient } from "../../../lib/supabase";
import { sendMail, rowsToHtml } from "../../../lib/mail";
import { rateLimit, clientIp } from "../../../lib/ratelimit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Column missing (migration not run yet): Postgres 42703 / PostgREST PGRST204
const isMissingColumn = (e) =>
  e && (e.code === "42703" || e.code === "PGRST204" || /column .* (does not exist|of 'messages')/i.test(e.message || ""));

export async function POST(req) {
  try {
    if (!rateLimit(`contact:${clientIp(req)}`, { limit: 5, windowMs: 10 * 60 * 1000 })) {
      return NextResponse.json(
        { error: "Too many messages in a short time. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Honeypot — real visitors never fill this. Pretend success so bots move on.
    if (clip(body.website, 200)) return NextResponse.json({ ok: true });

    const name = clip(body.name, 120);
    const email = clip(body.email, 200);
    const phone = clip(body.phone, 40);
    const service = clip(body.service, 120);
    let message = clip(body.message, 4000);
    const popup = body.source === "popup";
    const when = clip(body.when, 60);

    if (popup) {
      // Quick "Get in touch" popup: name + phone are enough.
      if (name.length < 2 || !/^[+\d][\d\s()-]{6,18}$/.test(phone)) {
        return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
      }
      message = [
        "Quick enquiry from the Get in touch popup.",
        service ? `Needs: ${service}` : "",
        when ? `Best time to call: ${when}` : "",
      ].filter(Boolean).join("\n");
    } else if (!name || !EMAIL.test(email) || !message) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    const supabase = getServiceClient();
    let { error } = await supabase.from("messages").insert([
      { name, email, phone: phone || null, service: service ? (popup ? `Popup · ${service}` : service) : (popup ? "Popup" : null), message },
    ]);

    // Migration not run yet: retry without the new column, keeping the service in the text.
    if (error && isMissingColumn(error)) {
      const folded = service ? `[Service: ${service}]\n\n${message}` : message;
      ({ error } = await supabase.from("messages").insert([
        { name, email, phone: phone || null, message: folded },
      ]));
    }

    if (error) throw error;

    // Email notification runs after the response is sent; never blocks or fails the visitor.
    after(async () => {
      try {
        const time = new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short",
        }) + " IST";
        const text = [
          `New ${popup ? "quick enquiry (popup)" : "enquiry"} from ${name}`,
          "",
          `Name: ${name}`,
          `Email: ${email || "-"}`,
          `Phone: ${phone || "-"}`,
          `Service: ${service || "-"}`,
          `Time: ${time}`,
          "",
          "Message:",
          message,
          "",
          "Open Dharma Vault → Messages",
        ].join("\n");
        const html = rowsToHtml(`New ${popup ? "quick enquiry" : "enquiry"} from ${name}`, [
          ["Name", name],
          ["Email", email || "-"],
          ["Phone", phone || "-"],
          ["Service", service || "-"],
          ["Best time", when || "-"],
          ["Time", time],
          ["Message", message],
          ["", "Open Dharma Vault → Messages"],
        ]);
        await sendMail({ subject: `${popup ? "Quick enquiry" : "New enquiry"} from ${name}${popup ? ` · ${phone}` : ""}`, text, html, replyTo: email || undefined });
      } catch (e) {
        console.error("Contact mail error:", e?.message || e);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
