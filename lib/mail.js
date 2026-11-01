// Minimal transactional mail helper (plain fetch, no dependencies).
// Provider auto-detect: Resend (RESEND_API_KEY) -> Brevo (BREVO_API_KEY).
// NEVER throws. Returns { ok, skipped?, error? }.

export function escapeHtml(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Builds a simple HTML email body from [label, value] rows. All content is escaped.
export function rowsToHtml(title, rows) {
  const tr = rows
    .filter(([, v]) => v !== undefined && v !== null && String(v) !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6a6d75;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td>` +
        `<td style="padding:6px 0;color:#0f1115;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`
    )
    .join("");
  return (
    `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">` +
    `<h2 style="margin:0 0 12px;font-weight:600">${escapeHtml(title)}</h2>` +
    `<table style="border-collapse:collapse">${tr}</table></div>`
  );
}

export async function sendMail({ subject, text, html, replyTo } = {}) {
  // MAIL_TO may hold several comma-separated addresses (business + personal).
  const recipients = (process.env.MAIL_TO || "dharmawebservice@gmail.com,dharmu17reddy@gmail.com")
    .split(/[,;\s]+/)
    .filter((x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x));
  const resendKey = process.env.RESEND_API_KEY;
  const brevoKey = process.env.BREVO_API_KEY;

  if (!resendKey && !brevoKey) return { ok: false, skipped: true };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);

  try {
    let res;
    if (resendKey) {
      // One email per recipient: Resend's free test sender rejects the whole
      // request if any address is not the account owner's, so a single bad
      // recipient must not stop the others from being delivered.
      const results = await Promise.all(
        recipients.map(async (to) => {
          const payload = {
            from: process.env.MAIL_FROM || "DWS Website <onboarding@resend.dev>",
            to: [to],
            subject: String(subject || "").slice(0, 200),
            text,
            html,
          };
          if (replyTo) payload.reply_to = replyTo;
          const r = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: ctrl.signal,
          });
          if (!r.ok) console.error(`Mail error (${to}): HTTP ${r.status}`, (await r.text().catch(() => "")).slice(0, 160));
          return r.ok;
        })
      );
      return results.some(Boolean) ? { ok: true } : { ok: false, error: "all recipients failed" };
    } else {
      const senderEmail = process.env.MAIL_FROM_EMAIL;
      if (!senderEmail) {
        console.error("Mail error: MAIL_FROM_EMAIL is required for Brevo");
        return { ok: false, error: "MAIL_FROM_EMAIL missing" };
      }
      const payload = {
        sender: { email: senderEmail, name: "DWS Website" },
        to: recipients.map((email) => ({ email })),
        subject: String(subject || "").slice(0, 200),
        textContent: text,
        htmlContent: html,
      };
      if (replyTo) payload.replyTo = { email: replyTo };
      res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoKey, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
    }

    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 200);
      const msg = `HTTP ${res.status} ${detail}`;
      console.error("Mail error:", msg);
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (err) {
    const msg = err?.name === "AbortError" ? "timeout" : err?.message || "unknown";
    console.error("Mail error:", msg);
    return { ok: false, error: msg };
  } finally {
    clearTimeout(timer);
  }
}
