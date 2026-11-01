"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Star, Package } from "lucide-react";
import { api, FOCUS, LoadingState, EmptyState, ErrorState, Modal, ModalHeader, Switch, fmtINR } from "./ui";

const EMPTY = {
  name: "", price: "", original_price: "", badge: "", description: "", features: "",
  cta: "Get started", service_label: "", display_order: 0, popular: false, active: true,
};

export default function PackagesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | package
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const r = await api("/api/admin/packages");
    if (r.ok) setItems(Array.isArray(r.data) ? r.data : []);
    else setError(r.error);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm({ ...EMPTY, display_order: items.length + 1 }); setSaveErr(""); setEditing("new"); };
  const openEdit = (p) => {
    setForm({
      name: p.name || "", price: p.price ?? "", original_price: p.original_price ?? "",
      badge: p.badge || "", description: p.description || "",
      features: (p.features || []).join("\n"), cta: p.cta || "Get started",
      service_label: p.service_label || "", display_order: p.display_order ?? 0,
      popular: !!p.popular, active: p.active !== false,
    });
    setSaveErr(""); setEditing(p);
  };
  const close = () => { setEditing(null); setSaveErr(""); };

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true); setSaveErr("");
    const body = {
      ...form,
      price: form.price === "" ? "" : Number(form.price),
      original_price: form.original_price === "" ? null : Number(form.original_price),
      display_order: Number(form.display_order) || 0,
      features: form.features.split("\n").map(s => s.trim()).filter(Boolean),
      service_label: form.service_label.trim() || `${form.name.trim()} Package — ₹${fmtINR(form.price)}`,
    };
    const isNew = editing === "new";
    const r = await api("/api/admin/packages", { method: isNew ? "POST" : "PATCH", body: isNew ? body : { ...body, id: editing.id } });
    setSaving(false);
    if (!r.ok) { setSaveErr(r.error); return; }
    close(); load();
  };

  const toggleActive = async (p) => {
    setBusyId(p.id);
    const r = await api("/api/admin/packages", { method: "PATCH", body: { id: p.id, active: !p.active } });
    setBusyId(null);
    if (!r.ok) setError(r.error); else load();
  };

  const remove = async (p) => {
    if (!confirm(`Delete the "${p.name}" package?`)) return;
    setBusyId(p.id);
    const r = await api("/api/admin/packages", { method: "DELETE", body: { id: p.id } });
    setBusyId(null);
    if (!r.ok) setError(r.error); else load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-sm text-mute">{items.length} packages</p>
          <p className="text-xs text-mute mt-0.5">Changes appear on the public site within seconds.</p>
        </div>
        <button onClick={openNew} className={`btn btn-primary btn-sm inline-flex items-center gap-1.5 ${FOCUS}`}>
          <Plus size={14} aria-hidden="true" /> Add Package
        </button>
      </div>

      {editing && (
        <Modal onClose={close} label={editing === "new" ? "Add package" : "Edit package"}>
          <ModalHeader title={editing === "new" ? "Add Package" : "Edit Package"} onClose={close} />
          <form onSubmit={save} className="space-y-3">
            <div>
              <label htmlFor="pkg-name" className="field-label">Name *</label>
              <input id="pkg-name" className="admin-input" required maxLength={120} value={form.name}
                     onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pkg-price" className="field-label">Price (₹) *</label>
                <input id="pkg-price" type="number" min="0" step="1" required className="admin-input" value={form.price}
                       onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label htmlFor="pkg-orig" className="field-label">Original price (₹)</label>
                <input id="pkg-orig" type="number" min="0" step="1" className="admin-input" value={form.original_price}
                       onChange={e => setForm({ ...form, original_price: e.target.value })} />
              </div>
            </div>
            <div>
              <label htmlFor="pkg-badge" className="field-label">Badge</label>
              <input id="pkg-badge" className="admin-input" maxLength={60} placeholder="e.g. Most popular" value={form.badge}
                     onChange={e => setForm({ ...form, badge: e.target.value })} />
            </div>
            <div>
              <label htmlFor="pkg-desc" className="field-label">Description</label>
              <textarea id="pkg-desc" rows={2} maxLength={2000} className="admin-input resize-none" value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label htmlFor="pkg-features" className="field-label">Features (one per line, max 20)</label>
              <textarea id="pkg-features" rows={6} className="admin-input" value={form.features}
                        onChange={e => setForm({ ...form, features: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pkg-cta" className="field-label">Button text</label>
                <input id="pkg-cta" className="admin-input" maxLength={60} value={form.cta}
                       onChange={e => setForm({ ...form, cta: e.target.value })} />
              </div>
              <div>
                <label htmlFor="pkg-order" className="field-label">Display order</label>
                <input id="pkg-order" type="number" className="admin-input" value={form.display_order}
                       onChange={e => setForm({ ...form, display_order: e.target.value })} />
              </div>
            </div>
            <div>
              <label htmlFor="pkg-label" className="field-label">Service label (shown in the contact form dropdown)</label>
              <input id="pkg-label" className="admin-input" maxLength={120}
                     placeholder={`${form.name.trim() || "Name"} Package — ₹${fmtINR(form.price)}`}
                     value={form.service_label}
                     onChange={e => setForm({ ...form, service_label: e.target.value })} />
              <p className="text-xs text-mute mt-1">Leave empty to use the suggestion shown.</p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 pt-1">
              <Switch label="Most popular" checked={form.popular} onChange={v => setForm({ ...form, popular: v })} />
              <Switch label="Active (visible)" checked={form.active} onChange={v => setForm({ ...form, active: v })} />
            </div>
            {saveErr && <p className="text-bad text-sm bg-sand px-3 py-2 rounded-lg" role="alert">{saveErr}</p>}
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving}
                      className={`btn btn-primary flex-1 disabled:opacity-60 flex items-center justify-center gap-2 ${FOCUS}`}>
                {saving ? <><span className="spinner" /> Saving…</> : "Save"}
              </button>
              <button type="button" onClick={close} className={`btn btn-ghost flex-1 ${FOCUS}`}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {error && !loading && items.length > 0 && <p className="text-bad text-sm mb-4" role="alert">{error}</p>}

      {loading ? <LoadingState /> : error && items.length === 0 ? (
        <ErrorState title="Could not load packages" error={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState icon={Package} text="No packages yet. Add your first package; it appears in the Pricing section of the site." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(p => (
            <div key={p.id} className="card p-5 flex flex-col" style={{ opacity: p.active ? 1 : 0.6 }}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="font-display text-2xl text-ink flex items-center gap-1.5">
                    {p.name}
                    {p.popular && <Star size={15} className="text-gold-ink" fill="currentColor" aria-label="Most popular" />}
                  </p>
                  {p.badge && <span className="badge badge-partial mt-1">{p.badge}</span>}
                </div>
                <button onClick={() => toggleActive(p)} disabled={busyId === p.id}
                        aria-label={`${p.active ? "Hide" : "Show"} ${p.name}`}
                        className={`badge ${p.active ? "badge-paid" : "badge-cancelled"} ${FOCUS}`}>
                  {p.active ? "Live" : "Hidden"}
                </button>
              </div>
              <p className="text-ink font-semibold text-xl">
                ₹{fmtINR(p.price)}
                {p.original_price ? <span className="ml-2 text-sm font-normal text-mute line-through">₹{fmtINR(p.original_price)}</span> : null}
              </p>
              {p.description && <p className="text-xs text-mute mt-2 line-clamp-2">{p.description}</p>}
              <p className="text-xs text-mute mt-2 mb-4">{(p.features || []).length} features</p>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => openEdit(p)}
                        className={`btn btn-ghost btn-sm flex-1 inline-flex items-center justify-center gap-1 ${FOCUS}`}>
                  <Pencil size={12} aria-hidden="true" /> Edit
                </button>
                <button onClick={() => remove(p)} disabled={busyId === p.id} aria-label={`Delete ${p.name}`}
                        className={`btn btn-ghost btn-sm inline-flex items-center justify-center gap-1 text-bad ${FOCUS}`}>
                  <Trash2 size={12} aria-hidden="true" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
