// Document generator for the Dharma Vault "Documents" tab.
// Pure string functions (no React, no dependencies): fast, testable, and shared by the
// live preview, the print-to-PDF flow and the Word download.
// Every value is HTML-escaped. Blank fields render as highlighted [placeholders].

export const DOC_LIST = [
  { id: "onboarding", no: "1", label: "Client onboarding checklist", short: "Onboarding" },
  { id: "agreement", no: "2", label: "Freelance service agreement", short: "Agreement" },
  { id: "invoice", no: "3", label: "Invoice", short: "Invoice" },
  { id: "payment", no: "4", label: "Payment terms", short: "Payment terms" },
  { id: "sow", no: "5", label: "Scope of work (SOW)", short: "Scope of work" },
  { id: "delivery", no: "6", label: "File delivery & access policy", short: "File delivery" },
  { id: "cancellation", no: "7", label: "Cancellation & termination policy", short: "Cancellation" },
  { id: "precheck", no: "✓", label: "Pre-project checklist (internal)", short: "Pre-project check" },
];

export const DEFAULTS = {
  // You
  provider_name: "Dharma Web Services",
  provider_owner: "Dharmendra Reddy M S",
  provider_email: "dharmawebservice@gmail.com",
  provider_phone: "+91 96112 41651",
  provider_address: "Hyderabad, India",
  // Fees
  advance_pct: "50",
  milestone_pct: "25",
  final_pct: "25",
  due_days: "7",
  payment_method: "Bank transfer / UPI",
  tax_pct: "0",
  invoice_for: "advance",
  advance_paid: "0",
  // Terms
  revisions: "3",
  notice_days: "7",
  cancel_days: "7",
  retention: "90 days",
  source_files: "not included",
  formats: "Live website, source code repository",
  comm_channel: "WhatsApp and email",
  show_note: false,
};

/* ── helpers ─────────────────────────────────────────────────────────────── */
const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);
const num = (x) => {
  const n = Number(String(x ?? "").replace(/[, ₹]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const ph = (t) => `<span class="ph">[${esc(t)}]</span>`;
const lines = (s) => String(s ?? "").split("\n").map((x) => x.trim()).filter(Boolean);

function fmtDate(s) {
  if (!s) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return String(s);
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function ctx(d) {
  const val = (k, label) => {
    const x = String(d[k] ?? "").trim();
    return x ? esc(x) : ph(label || k);
  };
  const date = (k, label) => (d[k] ? esc(fmtDate(d[k])) : ph(label || k));
  const money = (k, label) => (String(d[k] ?? "").trim() !== "" ? inr(num(d[k])) : ph(label || k));
  const ul = (k, label, tag = "ul") => {
    const items = lines(d[k]);
    return `<${tag}>${(items.length ? items.map(esc) : [ph(label)]).map((i) => `<li>${i}</li>`).join("")}</${tag}>`;
  };
  const total = num(d.total);
  const pct = (k) => num(d[k]);
  const amt = (k) => (total ? inr((total * pct(k)) / 100) : "");
  return { val, date, money, ul, total, pct, amt };
}

const checks = (items) => `<ul class="chk">${items.map((i) => `<li>☐ ${i}</li>`).join("")}</ul>`;
const field = (label, value) => `<li>${esc(label)}: ${value ? `<b class="fill">${esc(value)}</b>` : '<span class="blank"></span>'}</li>`;
const sign = (...labels) => labels.map((l) => `<p class="sig">${esc(l)}: <span class="line"></span></p>`).join("");
const head = (n, title, sub) => `<h1>${n ? `${esc(n)}. ` : ""}${esc(title)}</h1>${sub ? `<p class="sub">${esc(sub)}</p>` : ""}`;

/* ── 1 · Client onboarding checklist ─────────────────────────────────────── */
function onboarding(d) {
  const c = ctx(d);
  return `${head("1", "Client Onboarding Checklist", "Understand the client before you start working.")}
<p>Use this checklist to collect the information needed to deliver the project smoothly.</p>
<h3>Client details</h3>
<ul>${field("Client/business name", d.client_name)}${field("Primary contact", d.client_contact)}${field("Email address", d.client_email)}${field("Website/social media links", d.client_site)}${field("Industry", d.industry)}${field("Target audience", d.audience)}</ul>
<h3>Project details</h3>
<ul>${field("Project/service", d.project_name)}${field("Main business goal", d.goal)}${field("Expected deliverables", lines(d.deliverables).map((l) => l.split("|")[0].trim()).join(", "))}${field("Project start date", fmtDate(d.start))}${field("Expected completion date", fmtDate(d.end))}${field("Key milestones", d.milestones)}${field("Primary point of contact", d.poc)}</ul>
<h3>Brand and access requirements</h3>
${checks(["Brand guidelines received", "Logo and brand assets received", "Required content and files received", "Platform access arranged securely", "Existing strategy or reports received", `Communication channel agreed upon${d.comm_channel ? ` (${esc(d.comm_channel)})` : ""}`])}
<h3>Approval and workflow</h3>
${checks(["Feedback process agreed upon", "Approval authority identified", "Meeting frequency confirmed", "Response-time expectations established", "Payment arrangements confirmed", "Agreement signed"])}
<h3>Final onboarding check</h3>
${checks(["All essential information received", "Project expectations confirmed", "Required access available", "Agreement signed", "Advance payment received, if applicable"])}
<p><b>Rule:</b> Don't begin a project while essential information, approvals, or agreed payment requirements are still unresolved.</p>`;
}

/* ── 2 · Freelance agreement ─────────────────────────────────────────────── */
function agreement(d) {
  const c = ctx(d);
  const sched = c.total && (c.pct("advance_pct") || c.pct("milestone_pct") || c.pct("final_pct"))
    ? `Advance ${esc(d.advance_pct)}% (${c.amt("advance_pct")}), milestone ${esc(d.milestone_pct)}% (${c.amt("milestone_pct")}), final ${esc(d.final_pct)}% (${c.amt("final_pct")})`
    : ph("Advance, milestones, and final payment");
  const provider = `${esc(d.provider_name || "")}${d.provider_owner ? ` (${esc(d.provider_owner)})` : ""}` || ph("Your name/business name");
  return `${head("2", "Freelance Agreement Template", "Put your working relationship in writing.")}
<h2>FREELANCE SERVICE AGREEMENT</h2>
<p><b>Date:</b> ${d.agreement_date ? esc(fmtDate(d.agreement_date)) : esc(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }))}</p>
<p><b>Service Provider:</b> ${provider}</p>
<p><b>Client:</b> ${c.val("client_name", "Client name/business name")}</p>
<h3>1. Services</h3>
<p>The freelancer agrees to provide the following services:</p>
${c.ul("services", "Describe the services clearly.")}
<h3>2. Project duration</h3>
<p>The project will begin on ${c.date("start", "start date")} and is expected to conclude on ${c.date("end", "end date")}, subject to timely feedback, approvals, access, and client responsibilities.</p>
<h3>3. Fees and payment</h3>
<p>Total project fee: ${c.money("total", "Amount")}</p>
<p>Payment schedule: ${sched}</p>
<p>Payment method: ${c.val("payment_method", "Agreed method")}</p>
<p>Payment due dates: ${d.payment_dates ? esc(d.payment_dates) : `Advance before work begins; milestone payment on the agreed milestone; final payment within ${esc(d.due_days || "7")} days of delivery`}</p>
<h3>4. Revisions and additional work</h3>
<p>The fee includes ${c.val("revisions", "number")} rounds of revisions within the agreed scope.</p>
<p>Requests outside the agreed scope may require a separate quotation and written approval.</p>
<h3>5. Client responsibilities</h3>
<p>The client agrees to provide the necessary information, assets, access, feedback, and approvals within the agreed timelines.</p>
<h3>6. Ownership and usage rights</h3>
<p>Ownership, licensing, and transfer of final deliverables will be governed by the agreed terms, including any applicable outstanding payment conditions.</p>
<h3>7. Confidentiality</h3>
<p>Both parties agree to handle confidential business information responsibly and in accordance with the agreed confidentiality obligations.</p>
<h3>8. Termination</h3>
<p>Either party may terminate the engagement according to the notice period${d.notice_days ? ` (${esc(d.notice_days)} days' written notice)` : ""} and termination terms specified in this agreement.</p>
<p>Payment for completed work, approved expenses, and any applicable cancellation fees will be handled according to the agreed terms and applicable law.</p>
<h3>9. Dispute resolution</h3>
<p>The parties will first attempt to resolve disputes through good-faith discussion. Any further process will follow the applicable agreement and law.</p>
<div class="signs">${sign("Freelancer signature", "Client signature", "Date")}</div>
${d.show_note ? `<p class="note"><i>Important: This is a general starting template, not legal advice. Have a qualified professional review it for your jurisdiction, especially for intellectual property, liability, termination, and dispute-resolution clauses.</i></p>` : ""}`;
}

/* ── 3 · Invoice ─────────────────────────────────────────────────────────── */
export function invoiceLines(d) {
  const total = num(d.total);
  const proj = d.project_name ? ` — ${d.project_name}` : "";
  const kind = d.invoice_for || "advance";
  if (kind === "custom") {
    return lines(d.invoice_items).map((l) => {
      const [desc, amt] = l.split("|");
      return { desc: (desc || "").trim(), amount: num(amt) };
    });
  }
  const map = {
    advance: ["Advance payment", "advance_pct"],
    milestone: ["Milestone payment", "milestone_pct"],
    final: ["Final payment", "final_pct"],
  };
  const [label, key] = map[kind] || map.advance;
  const p = num(d[key]);
  if (!total) return [{ desc: `${label}${proj}`, amount: null }];
  return [{ desc: `${label} (${p}%)${proj}`, amount: (total * p) / 100 }];
}

function invoice(d) {
  const rows = invoiceLines(d);
  const subtotal = rows.reduce((s, r) => s + (r.amount || 0), 0);
  const taxPct = num(d.tax_pct);
  const tax = (subtotal * taxPct) / 100;
  const totalDue = subtotal + tax;
  const paid = num(d.advance_paid);
  const balance = totalDue - paid;
  const known = rows.every((r) => r.amount !== null);
  const m = (n) => (known ? inr(n) : ph("Amount"));
  const created = d.invoice_date ? fmtDate(d.invoice_date) : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const c = ctx(d);
  return `${head("3", "Invoice", "")}
<h2>INVOICE</h2>
<table class="meta"><tr><td><b>Invoice number:</b> ${c.val("invoice_number", "INV-001")}</td><td><b>Invoice date:</b> ${esc(created)}</td><td><b>Payment due date:</b> ${c.date("invoice_due", "Date")}</td></tr></table>
<div class="cols"><div><h3>From</h3><p>${esc(d.provider_name || "")}${d.provider_owner ? `<br>${esc(d.provider_owner)}` : ""}${d.provider_email ? `<br>${esc(d.provider_email)}` : ""}${d.provider_phone ? `<br>${esc(d.provider_phone)}` : ""}${d.provider_address ? `<br>${esc(d.provider_address)}` : ""}</p></div>
<div><h3>Bill to</h3><p>${c.val("client_name", "Client/business name")}${d.client_contact ? `<br>${esc(d.client_contact)}` : ""}${d.client_email ? `<br>${esc(d.client_email)}` : ""}${d.client_address ? `<br>${esc(d.client_address)}` : ""}</p></div></div>
<table class="grid"><thead><tr><th>Description</th><th class="r">Amount</th></tr></thead><tbody>
${rows.length ? rows.map((r) => `<tr><td>${esc(r.desc) || ph("Service/deliverable")}</td><td class="r">${r.amount === null ? ph("Amount") : inr(r.amount)}</td></tr>`).join("") : `<tr><td>${ph("Service/deliverable")}</td><td class="r">${ph("Amount")}</td></tr>`}
<tr><td>Subtotal</td><td class="r">${m(subtotal)}</td></tr>
<tr><td>Applicable taxes${taxPct ? ` (${taxPct}%)` : ""}</td><td class="r">${m(tax)}</td></tr>
<tr class="tot"><td>Total due</td><td class="r">${m(totalDue)}</td></tr>
<tr><td>Advance already paid</td><td class="r">${inr(paid)}</td></tr>
<tr class="tot"><td>Balance due</td><td class="r">${m(balance)}</td></tr></tbody></table>
<h3>Payment details</h3>
<ul><li>Payment method: ${c.val("payment_method", "Bank transfer/UPI/other")}</li><li>Payment details: ${d.payment_details ? `<span class="pre">${esc(d.payment_details)}</span>` : ph("Your details")}</li><li>Payment terms: ${d.pay_terms ? esc(d.pay_terms) : `Payable within ${esc(d.due_days || "7")} days of the invoice date`}</li></ul>
${d.invoice_notes ? `<p><b>Notes:</b> ${esc(d.invoice_notes)}</p>` : ""}
<p>Thank you for your business.</p>`;
}

/* ── 4 · Payment terms ───────────────────────────────────────────────────── */
function payment(d) {
  const c = ctx(d);
  const line = (k, label, extra) =>
    c.pct(k) ? `${label}: ${esc(d[k])}%${c.total ? ` (${c.amt(k)})` : ""}${extra || ""}` : `${label}: ${ph("Percentage/amount")}`;
  return `${head("4", "Payment Terms Template", "Decide how and when you'll get paid before work begins.")}
<p><b>Project:</b> ${c.val("project_name", "Project name")}</p>
<p><b>Client:</b> ${c.val("client_name", "Client name")}</p>
<p><b>Total fee:</b> ${c.money("total", "Amount")}</p>
<h2>Payment structure</h2>
<ul><li>${line("advance_pct", "Advance payment")}</li><li>${line("milestone_pct", "Milestone payment", d.milestone_trigger ? ` — ${esc(d.milestone_trigger)}` : "")}</li><li>${line("final_pct", "Final payment", ` — within ${esc(d.due_days || "7")} days of delivery`)}</li></ul>
<h2>Payment conditions</h2>
<h3>1. Advance payment</h3><p>Work will begin once the agreed advance has been received, unless another arrangement is documented.</p>
<h3>2. Payment deadlines</h3><p>Each invoice must be paid within ${c.val("due_days", "number")} calendar days of its issue date, or by the specific due date stated on the invoice.</p>
<h3>3. Late payments</h3><p>If a payment is overdue, the freelancer will contact the client to confirm the payment status. Any late fee must be clearly agreed upon in advance and permitted by applicable law.${d.late_fee ? ` Agreed late fee: ${esc(d.late_fee)}.` : ""}</p>
<h3>4. Pausing work</h3><p>If payment remains overdue, the freelancer may pause further work after providing notice, subject to the agreement and applicable law.</p>
<h3>5. Final delivery</h3><p>The timing of final file delivery, access transfer, and ownership rights will follow the agreed contract and payment conditions.</p>
<h3>6. Expenses</h3><p>Any additional expenses must be approved in writing before they are incurred.</p>
<div class="signs">${sign("Client approval", "Freelancer approval")}</div>`;
}

/* ── 5 · Scope of work ───────────────────────────────────────────────────── */
function sow(d) {
  const c = ctx(d);
  const rows = lines(d.deliverables).map((l) => l.split("|").map((x) => x.trim()));
  const names = rows.map((r) => r[0]).filter(Boolean);
  return `${head("5", "Scope of Work (SOW) Template", "Stop scope creep before it starts.")}
<p><b>Project name:</b> ${c.val("project_name", "Name")}</p>
<p><b>Client:</b> ${c.val("client_name", "Client name")}</p>
<p><b>Freelancer:</b> ${esc(d.provider_name || "")}${d.provider_owner ? ` (${esc(d.provider_owner)})` : ""}</p>
<h3>Project objective</h3><p>${d.goal ? esc(d.goal) : ph("Describe the business outcome the project is intended to support.")}</p>
<h3>Included services</h3>
<ol>${(names.length ? names.map(esc) : [ph("Deliverable 1"), ph("Deliverable 2"), ph("Deliverable 3")]).map((n) => `<li>${n}</li>`).join("")}</ol>
<h3>Deliverables and quantities</h3>
<table class="grid"><thead><tr><th>Deliverable</th><th>Quantity/frequency</th><th>Due date</th></tr></thead><tbody>
${(rows.length ? rows : [[]]).map((r) => `<tr><td>${r[0] ? esc(r[0]) : ph("Deliverable")}</td><td>${r[1] ? esc(r[1]) : ph("Quantity")}</td><td>${r[2] ? esc(fmtDate(r[2])) : ph("Date")}</td></tr>`).join("")}
</tbody></table>
<h3>Not included</h3>${c.ul("excluded", "Excluded service 1")}
<h3>Revisions</h3><p>The project includes ${c.val("revisions", "number")} revision rounds per deliverable. A revision means adjustments within the approved brief, not a completely new direction.</p>
<h3>Timeline</h3>
<ul><li>Project start: ${c.date("start", "Date")}</li><li>First draft: ${c.date("first_draft", "Date")}</li><li>Client feedback: ${d.feedback_window ? esc(d.feedback_window) : ph("Date/response window")}</li><li>Final delivery: ${c.date("end", "Date")}</li></ul>
<p>Timelines may shift if required information, approvals, or feedback are delayed.</p>
<h3>Client responsibilities</h3><p>The client will provide ${d.client_resp ? esc(d.client_resp) : ph("assets, access, approvals, feedback, and other requirements")}.</p>
<h3>Project fee</h3><p>${c.money("total", "Amount")}, payable according to the agreed payment schedule.</p>
<h3>Change requests</h3><p>Any additional deliverables, substantial revisions, or new requirements must be documented and approved in writing. Additional fees and timeline changes will be agreed upon before the extra work begins.</p>
<h3>Approval</h3>
<div class="signs">${sign("Client", "Freelancer", "Date")}</div>`;
}

/* ── 6 · File delivery & access ──────────────────────────────────────────── */
function delivery(d) {
  const c = ctx(d);
  const names = lines(d.deliverables).map((l) => l.split("|")[0].trim()).filter(Boolean);
  return `${head("6", "File Delivery & Access Policy", "Protect your work and keep project handovers organised.")}
<p><b>Project:</b> ${c.val("project_name", "Project name")}</p>
<p><b>Client:</b> ${c.val("client_name", "Client name")}</p>
<h3>File delivery</h3><p>The freelancer will deliver the following:</p>
<ul><li>Final deliverables: ${names.length ? esc(names.join(", ")) : ph("List")}</li><li>File formats: ${c.val("formats", "PDF/PNG/MP4/source files/etc.")}</li><li>Delivery location: ${c.val("delivery_location", "Drive/folder/platform")}</li><li>Delivery date: ${c.date("delivery_date", "Date")}</li></ul>
<h3>Source files</h3><p>Source or editable files are ${c.val("source_files", "included/not included")} in the agreed scope.</p>
<p>Any additional source files, licences, or third-party assets will be handled according to the written agreement.</p>
<h3>Access and account security</h3>
<ul><li>Access will be granted only where required.</li><li>Clients should use secure access-sharing methods.</li><li>Passwords and sensitive credentials should not be shared through unsecured channels.</li><li>Access will be revoked or transferred at the agreed handover stage.</li></ul>
<h3>File storage</h3><p>The freelancer will retain project files for ${c.val("retention", "agreed retention period")} after project completion.</p>
<p>After this period, files may be deleted unless otherwise agreed or required by law.</p>
<h3>Ownership and usage</h3><p>The client's rights to use final deliverables, and any transfer of ownership, will follow the signed agreement and applicable payment conditions.</p>
<div class="signs">${sign("Client confirmation", "Date")}</div>`;
}

/* ── 7 · Cancellation & termination ──────────────────────────────────────── */
function cancellation(d) {
  const c = ctx(d);
  return `${head("7", "Cancellation & Termination Policy", "What happens if a client cancels midway?")}
<p>Agree on this before the project begins.</p>
<p><b>Project:</b> ${c.val("project_name", "Project name")}</p>
<p><b>Client:</b> ${c.val("client_name", "Client name")}</p>
<h3>1. Cancellation by the client</h3><p>The client must provide ${c.val("cancel_days", "number")} days' written notice if they wish to cancel the project, subject to the agreed contract.</p>
<h3>2. Payment for completed work</h3><p>The client remains responsible for payment for work completed up to the effective cancellation date, along with any approved expenses and other amounts due under the agreement.</p>
<h3>3. Cancellation fees</h3><p>Any cancellation fee must be specified in advance and should reflect a reasonable, clearly defined basis, subject to applicable law.</p>
<p><b>Example clause:</b></p>
<p class="quote">"If the client cancels after project commencement, fees for completed milestones and approved expenses remain payable. Any additional cancellation charge will be calculated according to the terms agreed in this contract."</p>
<h3>4. Advance payments</h3><p>The treatment of advance payments will depend on the agreement, work completed, applicable cancellation terms, and relevant law. Avoid automatically describing every advance as non-refundable without appropriate contractual and legal review.</p>
<h3>5. Freelancer termination</h3><p>The freelancer may terminate the engagement under the circumstances and notice requirements specified in the agreement, including material non-payment or failure to meet agreed responsibilities, subject to applicable law.</p>
<h3>6. Handover after cancellation</h3><p>The parties will agree on which completed deliverables will be handed over, when outstanding payments are due, and how account access and confidential information will be handled.</p>
<div class="signs">${sign("Client signature", "Freelancer signature")}</div>`;
}

/* ── ✓ · Pre-project checklist (internal) ────────────────────────────────── */
function precheck(d) {
  return `<h1>Pre-Project Checklist</h1>
<p class="sub">${esc(d.client_name || "Client")}${d.project_name ? ` — ${esc(d.project_name)}` : ""}</p>
<p>Before starting your next freelance project, confirm:</p>
${checks(["Client onboarding checklist completed", "Agreement reviewed and signed", "Scope of work approved", "Payment terms documented", "Invoice sent for the required advance", "Required payment received", "File delivery and access policy agreed upon", "Cancellation terms documented", "Project communication and approval process established"])}
<h3>How to use these documents</h3>
<ol><li>Customise each template for your service and project.</li><li>Remove clauses that don't apply and clarify anything ambiguous.</li><li>Make sure the agreement, scope, payment schedule, and cancellation terms are consistent.</li><li>Share the relevant documents with your client and obtain written approval.</li><li>Save the signed documents and invoices in a dedicated client folder.</li></ol>`;
}

const BUILDERS = { onboarding, agreement, invoice, payment, sow, delivery, cancellation, precheck };

/* ── Full document assembly ──────────────────────────────────────────────── */
const CSS = `
@page{size:A4;margin:0}
*{box-sizing:border-box}
body{margin:0;font:14px/1.6 "Segoe UI",Arial,Helvetica,sans-serif;color:#1d2433;background:#fff}
.doc{padding:0;page-break-after:always;break-after:page}
.doc:last-child{page-break-after:auto;break-after:auto}
.lh{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:2px solid #b68a2e;padding-bottom:10px;margin-bottom:22px}
.lh .brand{display:flex;align-items:center;gap:10px;font:600 17px Georgia,serif;color:#14213d}
.lh img{height:34px;width:auto}
.lh .co{font-size:11px;line-height:1.5;color:#46506a;text-align:right}
h1{font:600 24px/1.2 Georgia,"Times New Roman",serif;color:#14213d;margin:0 0 4px;letter-spacing:-.01em}
h2{font:600 16px Georgia,serif;color:#14213d;margin:20px 0 6px;letter-spacing:.02em}
h3{font:700 13.5px "Segoe UI",Arial,sans-serif;color:#14213d;margin:16px 0 4px;break-after:avoid}
p{margin:0 0 8px}
.sub{font-weight:600;color:#46506a;margin-bottom:14px;font-size:15px}
ul,ol{margin:0 0 8px;padding-left:20px}li{margin:2px 0}
ul.chk{list-style:none;padding-left:0}
.fill{color:#14213d}.blank{display:inline-block;min-width:200px;border-bottom:1px solid #9aa3b8;height:1em;vertical-align:baseline}
table{border-collapse:collapse;width:100%;margin:8px 0 12px}
table.grid th{background:#14213d;color:#fff;text-align:left;padding:7px 10px;font-size:12.5px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
table.grid td{border-bottom:1px solid #e1dac6;padding:7px 10px;vertical-align:top}
.r{text-align:right}tr.tot td{font-weight:700;background:#f6efd9;-webkit-print-color-adjust:exact;print-color-adjust:exact}
table.meta td{padding:2px 14px 2px 0}.cols{display:flex;gap:40px}.cols>div{flex:1}
.signs{margin-top:22px;break-inside:avoid}.sig{margin:16px 0 0}.line{display:inline-block;width:240px;border-bottom:1px solid #46506a}
.quote{border-left:3px solid #b68a2e;padding-left:12px;color:#46506a;font-style:italic}
.note{font-size:12px;color:#5d6680;margin-top:16px}.pre{white-space:pre-line}
.ft{margin-top:26px;border-top:1px solid #e1dac6;padding-top:6px;font-size:10.5px;color:#5d6680;text-align:center}
.ph{background:#fff3b0;color:#7a5a00;padding:0 2px;border-radius:2px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
table.wrap{margin:0;width:100%;border-collapse:collapse}
table.wrap>thead>tr>td,table.wrap>tfoot>tr>td{padding:0;border:0}
table.wrap>thead>tr>td>div{height:15mm}table.wrap>tfoot>tr>td>div{height:16mm}
table.wrap>tbody>tr>td{padding:0 17mm;border:0;vertical-align:top}
@media screen{table.wrap>thead,table.wrap>tfoot{display:none}table.wrap>tbody>tr>td{padding:0 4px}}
@media print{body{font-size:13px;line-height:1.5}h3{margin:12px 0 3px}h2{margin:16px 0 5px}li{margin:1px 0}p{margin:0 0 6px}.lh{margin-bottom:16px}.ft{margin-top:18px}}
`;

function letterhead(d, logoUrl) {
  return `<div class="lh"><div class="brand">${logoUrl ? `<img src="${esc(logoUrl)}" alt="">` : ""}<span>${esc(d.provider_name || "Dharma Web Services")}</span></div>
<div class="co">${[d.provider_email, d.provider_phone, d.provider_address].filter(Boolean).map(esc).join("<br>")}</div></div>`;
}

/** Builds one complete HTML document containing every selected doc (each starts on a new page). */
export function buildDocument(ids, data, { logoUrl = "", title = "Documents", word = false } = {}) {
  const d = { ...DEFAULTS, ...data };
  const body = ids
    .filter((id) => BUILDERS[id])
    .map(
      (id) =>
        {
        const inner = `${letterhead(d, word ? "" : logoUrl)}${BUILDERS[id](d)}`;
        // Print: the empty header/footer rows repeat on every page and act as page margins,
        // so the browser's own date/URL/page-number lines are never printed (page margin is 0).
        return word
          ? `<section class="doc">${inner}</section>`
          : `<section class="doc"><table class="wrap"><thead><tr><td><div></div></td></tr></thead><tbody><tr><td>${inner}</td></tr></tbody><tfoot><tr><td><div></div></td></tr></tfoot></table></section>`;
      }
    )
    .join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${CSS}</style></head><body>${body}</body></html>`;
}

/** How many highlighted [placeholders] are still unfilled in the selected documents. */
export function countBlanks(ids, data) {
  const d = { ...DEFAULTS, ...data };
  let n = 0;
  for (const id of ids) {
    if (id === "onboarding" || id === "precheck") continue; // checklists are meant to be filled by hand
    const html = BUILDERS[id]?.(d) || "";
    n += (html.match(/class="ph"/g) || []).length;
  }
  return n;
}

export const slugName = (s) =>
  String(s || "client").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "client";