"use client";
import { useState, useEffect, useCallback } from "react";
import { Link2, Copy, Check, RefreshCw, Trash2, Eye, MessageCircle, Plus } from "lucide-react";
import { api, FOCUS, LoadingState, EmptyState, ErrorState, Modal, ModalHeader } from "./ui";
import { answersToRows } from "../onboard/fields";

const linkFor = (token) => `${window.location.origin}/onboard/${token}`;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function statusOf(row) {
  if (row.status === "submitted") return "submitted";
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return "expired";
  return "pending";
}

const BADGE = {
  pending: ["badge badge-pending", "Pending"],
  submitted: ["badge badge-paid", "Submitted"],
  expired: ["badge badge-cancelled", "Expired"],
};

function CopyButton({ text, label = "Copy link", className = "" }) {
  const [state, setState] = useState("idle");
  const click = async () => {
    const ok = await copyText(text);
    setState(ok ? "ok" : "fail");
    setTimeout(() => setState("idle"), 1800);
  };
  return (
    <button type="button" onClick={click} className={`btn btn-ghost btn-sm inline-flex items-center gap-1.5 ${FOCUS} ${className}`}>
      {state === "ok" ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      {state === "ok" ? "Copied" : state === "fail" ? "Copy failed" : label}
    </button>
  );
}

export default function OnboardingTab() {
  const [rows, setRows] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ client_name: "", client_email: "", package_name: "", days: "14" });
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");
  const [created, setCreated] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const r = await api("/api/admin/onboarding");
    if (r.ok) setRows(Array.isArray(r.data) ? r.data : []);
    else setError(r.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    api("/api/admin/packages").then(r => { if (r.ok && Array.isArray(r.data)) setPackages(r.data); });
  }, [load]);

  const create = async (e) => {
    e.preventDefault();
    if (creating) return;
    setCreating(true); setCreateErr("");
    const r = await api("/api/admin/onboarding", {
      method: "POST",
      body: { ...form, days: Number(form.days), package_name: form.package_name || undefined },
    });
    setCreating(false);
    if (!r.ok) { setCreateErr(r.error); return; }
    setCreated(r.data);
    setForm({ client_name: "", client_email: "", package_name: "", days: form.days });
    load();
  };

  const regenerate = async (row) => {
    if (!confirm(`Issue a new link for ${row.client_name}? The old link will stop working.`)) return;
    setBusyId(row.id);
    const r = await api("/api/admin/onboarding", { method: "PATCH", body: { id: row.id, regenerate: true } });
    setBusyId(null);
    if (!r.ok) { setError(r.error); return; }
    setCreated(r.data);
    load();
  };

  const remove = async (row) => {
    if (!confirm(`Delete the onboarding link for ${row.client_name}? Submitted answers will be deleted too.`)) return;
    setBusyId(row.id);
    const r = await api("/api/admin/onboarding", { method: "DELETE", body: { id: row.id } });
    setBusyId(null);
    if (!r.ok) { setError(r.error); return; }
    if (created?.id === row.id) setCreated(null);
    load();
  };

  const createdUrl = created ? linkFor(created.token) : "";
  const waText = created
    ? `Hi ${created.client_name}, please fill in this short project onboarding form so we can get started: ${createdUrl}`
    : "";

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="card p-5 sm:p-6">
        <h3 className="font-display text-2xl font-normal text-ink">New onboarding link</h3>
        <p className="text-xs text-mute mt-1 mb-4">
          Send a private form to a new client. They need no account, and the link is never listed publicly.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label htmlFor="ob-name" className="field-label">Client name *</label>
            <input id="ob-name" required maxLength={120} className="admin-input" value={form.client_name}
                   onChange={e => setForm({ ...form, client_name: e.target.value })} />
          </div>
          <div>
            <label htmlFor="ob-email" className="field-label">Client email</label>
            <input id="ob-email" type="email" maxLength={200} className="admin-input" value={form.client_email}
                   onChange={e => setForm({ ...form, client_email: e.target.value })} />
          </div>
          <div>
            <label htmlFor="ob-package" className="field-label">Package</label>
            <select id="ob-package" className="admin-input" value={form.package_name}
                    onChange={e => setForm({ ...form, package_name: e.target.value })}>
              <option value="">— None —</option>
              {packages.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ob-days" className="field-label">Expires in</label>
            <select id="ob-days" className="admin-input" value={form.days}
                    onChange={e => setForm({ ...form, days: e.target.value })}>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
        </div>
        {createErr && <p className="text-bad text-sm bg-sand px-3 py-2 rounded-lg mt-3" role="alert">{createErr}</p>}
        <button type="submit" disabled={creating}
                className={`btn btn-primary btn-sm mt-4 inline-flex items-center gap-1.5 disabled:opacity-60 ${FOCUS}`}>
          {creating ? <><span className="spinner" /> Creating…</> : <><Plus size={14} aria-hidden="true" /> Create link</>}
        </button>

        {created && (
          <div className="panel p-4 mt-5" role="status">
            <p className="text-xs text-mute mb-2">Link for {created.client_name} — share it with them:</p>
            <input readOnly aria-label="Onboarding link" value={createdUrl}
                   onFocus={e => e.target.select()} className="admin-input font-mono text-xs" />
            <div className="flex flex-wrap gap-2 mt-3">
              <CopyButton text={createdUrl} />
              <a href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer"
                 className={`btn btn-ghost btn-sm inline-flex items-center gap-1.5 ${FOCUS}`}>
                <MessageCircle size={13} aria-hidden="true" /> Share on WhatsApp
              </a>
            </div>
          </div>
        )}
      </form>

      {error && !loading && rows.length > 0 && <p className="text-bad text-sm" role="alert">{error}</p>}

      {loading ? <LoadingState /> : error && rows.length === 0 ? (
        <ErrorState title="Could not load onboarding links" error={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState icon={Link2} text="No onboarding links yet. Create one above and send it to a new client." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="admin-table min-w-[640px] w-full">
            <thead>
              <tr><th>Client</th><th>Package</th><th>Status</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const st = statusOf(row);
                const [cls, label] = BADGE[st];
                return (
                  <tr key={row.id}>
                    <td>
                      <p className="font-medium text-ink text-sm">{row.client_name}</p>
                      <p className="text-xs text-mute">{row.client_email}</p>
                    </td>
                    <td className="text-sm text-ink-2">{row.package_name || "—"}</td>
                    <td><span className={cls}>{label}</span></td>
                    <td className="text-xs text-mute">{new Date(row.created_at).toLocaleDateString("en-IN")}</td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        {st === "submitted" && (
                          <button onClick={() => setViewing(row)} aria-label={`View answers from ${row.client_name}`}
                                  className={`btn btn-primary btn-sm inline-flex items-center gap-1 ${FOCUS}`}>
                            <Eye size={12} aria-hidden="true" /> View answers
                          </button>
                        )}
                        {st === "pending" && <CopyButton text={linkFor(row.token)} />}
                        <button onClick={() => regenerate(row)} disabled={busyId === row.id}
                                aria-label={`Regenerate link for ${row.client_name}`}
                                className={`btn btn-ghost btn-sm inline-flex items-center gap-1 ${FOCUS}`}>
                          <RefreshCw size={12} aria-hidden="true" /> Regenerate
                        </button>
                        <button onClick={() => remove(row)} disabled={busyId === row.id}
                                aria-label={`Delete link for ${row.client_name}`}
                                className={`btn btn-ghost btn-sm inline-flex items-center gap-1 text-bad ${FOCUS}`}>
                          <Trash2 size={12} aria-hidden="true" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewing && <AnswersModal row={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function AnswersModal({ row, onClose }) {
  const items = answersToRows(row.answers);
  const asText = [
    `Onboarding — ${row.client_name}${row.package_name ? ` (${row.package_name})` : ""}`,
    row.submitted_at ? `Submitted: ${new Date(row.submitted_at).toLocaleString("en-IN")}` : "",
    "",
    ...items.map(([k, v]) => `${k}: ${v}`),
  ].filter((l, i) => l !== "" || i > 0).join("\n");

  return (
    <Modal maxWidth="max-w-xl" onClose={onClose} label={`Answers from ${row.client_name}`}>
      <ModalHeader title={`Answers — ${row.client_name}`} onClose={onClose} />
      {row.submitted_at && (
        <p className="text-xs text-mute -mt-3 mb-4">Submitted {new Date(row.submitted_at).toLocaleString("en-IN")}</p>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-mute">No answers were stored.</p>
      ) : (
        <dl className="space-y-3">
          {items.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] uppercase tracking-wider text-mute font-medium">{k}</dt>
              <dd className="text-sm text-ink-2 whitespace-pre-wrap break-words">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="flex gap-3 pt-5">
        <CopyButton text={asText} label="Copy as text" className="flex-1 justify-center" />
        <button type="button" onClick={onClose} className={`btn btn-primary flex-1 ${FOCUS}`}>Close</button>
      </div>
    </Modal>
  );
}
