"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { FileText, Printer, Download, Save, Trash2, Plus, FileDown, AlertTriangle, Check } from "lucide-react";
import { api, FOCUS, LoadingState, ErrorState } from "./ui";
import { DOC_LIST, DEFAULTS, buildDocument, countBlanks, slugName } from "../../lib/docs";
import { GOALS, FEATURES } from "../onboard/fields";

/* ── Field definitions: one source of truth for the form ─────────────────── */
const SECTIONS = [
  {
    id: "client", title: "Client", open: true,
    fields: [
      ["client_name", "Client / business name *", "text"],
      ["client_contact", "Contact person", "text"],
      ["client_email", "Email", "email"],
      ["client_phone", "Phone", "text"],
      ["client_address", "Address (for invoice)", "text", "full"],
      ["client_site", "Website / social links", "text"],
      ["industry", "Industry", "text"],
      ["audience", "Target audience", "text", "full"],
    ],
  },
  {
    id: "project", title: "Project & scope", open: true,
    fields: [
      ["project_name", "Project name", "text", "full"],
      ["goal", "Main business goal / objective", "area", "full"],
      ["services", "Services you will provide (one per line)", "area", "full"],
      ["deliverables", "Deliverables: Name | Quantity | Due date (YYYY-MM-DD), one per line", "area", "full"],
      ["excluded", "Not included (one per line)", "area", "full"],
      ["start", "Start date", "date"],
      ["end", "Expected completion date", "date"],
      ["first_draft", "First draft date", "date"],
      ["feedback_window", "Client feedback window (e.g. within 2 days)", "text"],
      ["milestones", "Key milestones", "text", "full"],
      ["poc", "Primary point of contact", "text"],
      ["client_resp", "Client will provide (assets, access, approvals…)", "text", "full"],
    ],
  },
  {
    id: "fees", title: "Fees & payment",
    fields: [
      ["total", "Total project fee (₹)", "number"],
      ["advance_pct", "Advance %", "number"],
      ["milestone_pct", "Milestone %", "number"],
      ["final_pct", "Final %", "number"],
      ["milestone_trigger", "Milestone trigger (e.g. on design approval)", "text", "full"],
      ["due_days", "Invoice due within (days)", "number"],
      ["payment_method", "Payment method", "text"],
      ["late_fee", "Late fee (optional)", "text"],
      ["payment_details", "Your payment details (UPI / bank)", "area", "full"],
      ["payment_dates", "Payment due dates (optional, overrides the default wording)", "text", "full"],
    ],
  },
  {
    id: "invoice", title: "Invoice",
    fields: [
      ["invoice_for", "Invoice for", "select", "", [["advance", "Advance payment"], ["milestone", "Milestone payment"], ["final", "Final payment"], ["custom", "Custom line items"]]],
      ["invoice_number", "Invoice number", "text"],
      ["invoice_date", "Invoice date (blank = today)", "date"],
      ["invoice_due", "Payment due date", "date"],
      ["tax_pct", "Tax % (GST etc., 0 if none)", "number"],
      ["advance_paid", "Advance already paid (₹)", "number"],
      ["invoice_items", "Custom items: Description | Amount, one per line (only if “Custom”)", "area", "full"],
      ["invoice_notes", "Notes (PO number, reference…)", "text", "full"],
    ],
  },
  {
    id: "terms", title: "Terms, delivery & cancellation",
    fields: [
      ["revisions", "Revision rounds", "number"],
      ["notice_days", "Termination notice (days)", "number"],
      ["cancel_days", "Client cancellation notice (days)", "number"],
      ["retention", "File retention period", "text"],
      ["source_files", "Source files", "select", "", [["included", "Included"], ["not included", "Not included"]]],
      ["formats", "Delivery formats", "text", "full"],
      ["delivery_location", "Delivery location (Drive / folder)", "text"],
      ["delivery_date", "Delivery date", "date"],
      ["comm_channel", "Communication channel", "text"],
      ["agreement_date", "Agreement date (blank = today)", "date"],
      ["jurisdiction", "Jurisdiction (courts at)", "text"],
      ["show_note", "Show “not legal advice” note on the agreement", "check", "full"],
    ],
  },
  {
    id: "you", title: "Your details (letterhead)",
    fields: [
      ["provider_name", "Business name", "text"],
      ["provider_owner", "Your name", "text"],
      ["provider_email", "Email", "email"],
      ["provider_phone", "Phone", "text"],
      ["provider_address", "Address", "text", "full"],
      ["provider_website", "Website", "text"],
      ["provider_gstin", "GSTIN (optional)", "text"],
    ],
  },
];

const todayYear = () => new Date().getFullYear();
function freshForm(count) {
  return { ...DEFAULTS, invoice_number: `INV-${todayYear()}-${String((count || 0) + 1).padStart(3, "0")}` };
}

function Field({ def, value, onChange }) {
  const [k, label, type, span, opts] = def;
  const wrap = span === "full" ? "sm:col-span-2" : "";
  if (type === "check") {
    return (
      <label className={`flex items-center gap-2 text-sm text-ink-2 ${wrap}`}>
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(k, e.target.checked)} className="h-4 w-4 accent-[#b68a2e]" />
        {label}
      </label>
    );
  }
  return (
    <div className={wrap}>
      <label htmlFor={`d-${k}`} className="field-label">{label}</label>
      {type === "area" ? (
        <textarea id={`d-${k}`} rows={3} className="admin-input resize-y" value={value ?? ""} onChange={(e) => onChange(k, e.target.value)} />
      ) : type === "select" ? (
        <select id={`d-${k}`} className="admin-input" value={value ?? ""} onChange={(e) => onChange(k, e.target.value)}>
          {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : (
        <input id={`d-${k}`} type={type === "number" ? "text" : type} inputMode={type === "number" ? "decimal" : undefined}
               className="admin-input" value={value ?? ""} onChange={(e) => onChange(k, e.target.value)} />
      )}
    </div>
  );
}

export default function DocumentsTab() {
  const [projects, setProjects] = useState([]);
  const [onb, setOnb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ text: "", migration: false });
  const [currentId, setCurrentId] = useState(""); // "" = unsaved new project
  const [form, setForm] = useState(() => freshForm(0));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [ids, setIds] = useState(DOC_LIST.slice(0, 7).map((d) => d.id));
  const [pv, setPv] = useState(form);
  const msgTimer = useRef(null);

  const load = useCallback(async () => {
    setLoading(true); setError({ text: "", migration: false });
    const r = await api("/api/admin/docs");
    if (r.ok) {
      const list = Array.isArray(r.data) ? r.data : [];
      setProjects(list);
      setForm((f) => (dirty || currentId ? f : freshForm(list.length)));
    } else setError({ text: r.error, migration: r.migration });
    setLoading(false);
    // Optional: submitted onboarding forms can pre-fill a client.
    const o = await api("/api/admin/onboarding");
    if (o.ok && Array.isArray(o.data)) setOnb(o.data.filter((x) => x.answers && x.status === "submitted"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { load(); }, [load]);

  // Debounce the live preview so typing stays smooth.
  useEffect(() => {
    const t = setTimeout(() => setPv(form), 220);
    return () => clearTimeout(t);
  }, [form]);

  const flash = (t) => {
    setMsg(t);
    clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMsg(""), 3500);
  };

  const set = useCallback((k, v) => { setForm((f) => ({ ...f, [k]: v })); setDirty(true); }, []);

  const logoUrl = typeof window !== "undefined" ? `${window.location.origin}/dws-mark.png` : "";
  const clientTitle = form.client_name || "Client";
  const html = useMemo(
    () => buildDocument(ids, pv, { logoUrl, title: `${clientTitle} - documents` }),
    [ids, pv, logoUrl, clientTitle]
  );
  const blanks = useMemo(() => countBlanks(ids, pv), [ids, pv]);
  const pctSum = (Number(form.advance_pct) || 0) + (Number(form.milestone_pct) || 0) + (Number(form.final_pct) || 0);

  /* ── project actions ── */
  const openProject = (id) => {
    if (dirty && !window.confirm("You have unsaved changes. Discard them?")) return;
    setCurrentId(id);
    setDirty(false);
    if (!id) return setForm(freshForm(projects.length));
    const p = projects.find((x) => x.id === id);
    setForm({ ...DEFAULTS, ...(p?.data || {}), client_name: p?.client_name || "", project_name: p?.project_name || "" });
  };

  const save = async () => {
    if (saving) return;
    if (!form.client_name?.trim()) return flash("Enter the client name first.");
    setSaving(true);
    const body = { client_name: form.client_name, project_name: form.project_name, data: form };
    const r = await api("/api/admin/docs", { method: currentId ? "PATCH" : "POST", body: currentId ? { ...body, id: currentId } : body });
    setSaving(false);
    if (!r.ok) return flash(r.error);
    setCurrentId(r.data.id);
    setDirty(false);
    setProjects((list) => [r.data, ...list.filter((x) => x.id !== r.data.id)]);
    flash("Saved.");
  };

  const remove = async () => {
    if (!currentId || !window.confirm("Delete this saved project? Generated files you already downloaded are not affected.")) return;
    const r = await api("/api/admin/docs", { method: "DELETE", body: { id: currentId } });
    if (!r.ok) return flash(r.error);
    setProjects((l) => l.filter((x) => x.id !== currentId));
    setCurrentId(""); setDirty(false); setForm(freshForm(projects.length - 1));
    flash("Deleted.");
  };

  const importOnboarding = (id) => {
    const row = onb.find((x) => x.id === id);
    if (!row) return;
    const a = row.answers || {};
    const goalNames = (a.goals || []).map((g) => (GOALS.find((x) => x[0] === g) || [])[1]).filter(Boolean);
    const featNames = (a.features || []).map((g) => (FEATURES.find((x) => x[0] === g) || [])[1]).filter(Boolean);
    const pages = a.pages || [];
    setForm((f) => ({
      ...f,
      client_name: a.business_name || row.client_name || f.client_name,
      client_contact: a.contact_person || f.client_contact,
      client_email: a.email || row.client_email || f.client_email,
      client_phone: a.phone || f.client_phone,
      client_site: a.existing_website || f.client_site,
      audience: a.target_audience || f.audience,
      goal: goalNames.join(", ") || f.goal,
      services: f.services || ["Website design and development", ...featNames].join("\n"),
      deliverables: f.deliverables || pages.map((p) => `${p} page | 1 |`).join("\n"),
      project_name: f.project_name || (row.package_name ? `${row.package_name} website` : f.project_name),
    }));
    setDirty(true);
    flash("Filled from the onboarding form. Review the details below.");
  };

  /* ── output actions ── */
  const filename = () => `${slugName(form.client_name)}-${ids.length === 1 ? ids[0] : "documents"}`;
  const confirmBlanks = () =>
    blanks === 0 || window.confirm(`${blanks} field${blanks > 1 ? "s are" : " is"} still blank (highlighted yellow in the preview). Continue anyway?`);

  const printPdf = () => {
    if (!ids.length) return flash("Select at least one document.");
    if (!confirmBlanks()) return;
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    const prevTitle = document.title;
    const name = filename();
    frame.srcdoc = buildDocument(ids, form, { logoUrl, title: name });
    frame.onload = () => {
      const w = frame.contentWindow;
      const done = () => { document.title = prevTitle; setTimeout(() => frame.remove(), 500); };
      w.addEventListener("afterprint", done);
      document.title = name; // becomes the default "Save as PDF" file name
      setTimeout(() => { w.focus(); w.print(); }, 250); // wait for the logo to load
      setTimeout(done, 120000);
    };
    document.body.appendChild(frame);
  };

  const downloadWord = () => {
    if (!ids.length) return flash("Select at least one document.");
    if (!confirmBlanks()) return;
    const out = buildDocument(ids, form, { word: true, title: filename() });
    const blob = new Blob(["﻿", out], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename()}.doc`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const toggle = (id) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id].sort((a, b) => DOC_LIST.findIndex((d) => d.id === a) - DOC_LIST.findIndex((d) => d.id === b))));

  if (loading) return <LoadingState text="Loading documents…" />;
  if (error.text) {
    return (
      <ErrorState
        title={error.migration ? "One-time database step needed" : "Could not load documents"}
        error={error.migration ? "Run supabase-migration.sql in the Supabase SQL Editor (it adds the doc_projects table), then reload." : error.text}
        onRetry={load}
      />
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-2xl text-ink">Documents</h2>
        <p className="text-sm text-mute">Fill the details once, then generate the agreement, invoice, scope of work and more for any client.</p>
      </div>

      {/* Project bar */}
      <div className="card p-4 mb-5 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="doc-project" className="field-label">Saved project</label>
          <select id="doc-project" className="admin-input" value={currentId} onChange={(e) => openProject(e.target.value)}>
            <option value="">+ New project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.client_name}{p.project_name ? ` — ${p.project_name}` : ""}</option>)}
          </select>
        </div>
        {onb.length > 0 && (
          <div className="min-w-[200px] flex-1">
            <label htmlFor="doc-onb" className="field-label">Fill from an onboarding form</label>
            <select id="doc-onb" className="admin-input" value="" onChange={(e) => importOnboarding(e.target.value)}>
              <option value="">Choose a client…</option>
              {onb.map((o) => <option key={o.id} value={o.id}>{o.client_name}</option>)}
            </select>
          </div>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={save} disabled={saving} className={`btn btn-primary btn-sm inline-flex items-center gap-1.5 ${FOCUS}`}>
            {saving ? <span className="spinner" /> : <Save size={14} aria-hidden="true" />} {currentId ? "Save changes" : "Save project"}
          </button>
          {currentId && (
            <button type="button" onClick={remove} className={`btn btn-ghost btn-sm inline-flex items-center gap-1.5 ${FOCUS}`} aria-label="Delete project">
              <Trash2 size={14} aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="w-full text-xs text-mute" role="status" aria-live="polite">
          {msg || (dirty ? "Unsaved changes" : currentId ? "All changes saved" : "New project, not saved yet")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
        {/* ── Form ── */}
        <div className="space-y-3">
          {SECTIONS.map((s) => (
            <details key={s.id} open={s.open} className="card group">
              <summary className={`flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-ink ${FOCUS}`}>
                {s.title}
                <span className="text-mute transition-transform group-open:rotate-45 text-lg leading-none" aria-hidden="true">+</span>
              </summary>
              <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2">
                {s.fields.map((def) => <Field key={def[0]} def={def} value={form[def[0]]} onChange={set} />)}
                {s.id === "fees" && pctSum !== 100 && (
                  <p className="sm:col-span-2 flex items-center gap-1.5 text-xs text-warn">
                    <AlertTriangle size={13} aria-hidden="true" /> Advance + milestone + final = {pctSum}% (should be 100%).
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>

        {/* ── Documents + preview ── */}
        <div className="lg:sticky lg:top-20 space-y-3">
          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Documents to generate</p>
              <div className="flex gap-3 text-xs">
                <button type="button" className={`text-gold-ink underline ${FOCUS}`} onClick={() => setIds(DOC_LIST.slice(0, 7).map((d) => d.id))}>All 7</button>
                <button type="button" className={`text-mute underline ${FOCUS}`} onClick={() => setIds([])}>None</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {DOC_LIST.map((d) => {
                const on = ids.includes(d.id);
                return (
                  <button key={d.id} type="button" onClick={() => toggle(d.id)} aria-pressed={on}
                          className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors ${on ? "border-ink bg-ink text-white" : "border-line-2 bg-paper text-ink-2 hover:border-ink"} ${FOCUS}`}>
                    {on ? <Check size={12} aria-hidden="true" /> : <FileText size={12} aria-hidden="true" />} {d.no === "✓" ? d.short : `${d.no}. ${d.short}`}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={printPdf} disabled={!ids.length} className={`btn btn-gold btn-sm inline-flex items-center gap-1.5 disabled:opacity-50 ${FOCUS}`}>
                <Printer size={14} aria-hidden="true" /> Download PDF
              </button>
              <button type="button" onClick={downloadWord} disabled={!ids.length} className={`btn btn-ghost btn-sm inline-flex items-center gap-1.5 disabled:opacity-50 ${FOCUS}`}>
                <FileDown size={14} aria-hidden="true" /> Word (.doc)
              </button>
              <span className={`text-xs ${blanks ? "text-warn" : "text-ok"}`}>
                {blanks ? `${blanks} blank field${blanks > 1 ? "s" : ""} (yellow)` : "All fields filled"}
              </span>
            </div>
            <p className="mt-2 text-xs text-mute">PDF: in the window that opens, choose “Save as PDF” as the destination.</p>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line bg-sand px-4 py-2 text-xs text-mute">
              <span>Live preview</span><span>{ids.length} document{ids.length === 1 ? "" : "s"}</span>
            </div>
            {ids.length ? (
              <iframe title="Document preview" srcDoc={html} className="h-[70vh] w-full bg-white" sandbox="" />
            ) : (
              <p className="p-10 text-center text-sm text-mute">Select a document above to preview it.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}