"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Quote } from "lucide-react";
import { api, FOCUS, LoadingState, EmptyState, ErrorState, Modal, ModalHeader, Switch } from "./ui";

const EMPTY = { name: "", role: "", text: "", display_order: 0, active: true };

export default function TestimonialsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const r = await api("/api/admin/testimonials");
    if (r.ok) setItems(Array.isArray(r.data) ? r.data : []);
    else setError(r.error);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm({ ...EMPTY, display_order: items.length + 1 }); setSaveErr(""); setEditing("new"); };
  const openEdit = (t) => {
    setForm({ name: t.name || "", role: t.role || "", text: t.text || "", display_order: t.display_order ?? 0, active: t.active !== false });
    setSaveErr(""); setEditing(t);
  };
  const close = () => { setEditing(null); setSaveErr(""); };

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true); setSaveErr("");
    const body = { ...form, display_order: Number(form.display_order) || 0 };
    const isNew = editing === "new";
    const r = await api("/api/admin/testimonials", { method: isNew ? "POST" : "PATCH", body: isNew ? body : { ...body, id: editing.id } });
    setSaving(false);
    if (!r.ok) { setSaveErr(r.error); return; }
    close(); load();
  };

  const toggleActive = async (t) => {
    setBusyId(t.id);
    const r = await api("/api/admin/testimonials", { method: "PATCH", body: { id: t.id, active: !t.active } });
    setBusyId(null);
    if (!r.ok) setError(r.error); else load();
  };

  const remove = async (t) => {
    if (!confirm(`Delete the testimonial from ${t.name}?`)) return;
    setBusyId(t.id);
    const r = await api("/api/admin/testimonials", { method: "DELETE", body: { id: t.id } });
    setBusyId(null);
    if (!r.ok) setError(r.error); else load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-sm text-mute">{items.length} testimonials</p>
          <p className="text-xs text-mute mt-0.5">Changes appear on the public site within seconds.</p>
        </div>
        <button onClick={openNew} className={`btn btn-primary btn-sm inline-flex items-center gap-1.5 ${FOCUS}`}>
          <Plus size={14} aria-hidden="true" /> Add Testimonial
        </button>
      </div>

      {editing && (
        <Modal onClose={close} label={editing === "new" ? "Add testimonial" : "Edit testimonial"}>
          <ModalHeader title={editing === "new" ? "Add Testimonial" : "Edit Testimonial"} onClose={close} />
          <form onSubmit={save} className="space-y-3">
            <div>
              <label htmlFor="tm-name" className="field-label">Name *</label>
              <input id="tm-name" className="admin-input" required maxLength={120} value={form.name}
                     onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="tm-role" className="field-label">Role / company</label>
              <input id="tm-role" className="admin-input" maxLength={120} value={form.role}
                     onChange={e => setForm({ ...form, role: e.target.value })} />
            </div>
            <div>
              <label htmlFor="tm-text" className="field-label">Quote *</label>
              <textarea id="tm-text" rows={5} required maxLength={2000} className="admin-input" value={form.text}
                        onChange={e => setForm({ ...form, text: e.target.value })} />
            </div>
            <div>
              <label htmlFor="tm-order" className="field-label">Display order</label>
              <input id="tm-order" type="number" className="admin-input" value={form.display_order}
                     onChange={e => setForm({ ...form, display_order: e.target.value })} />
            </div>
            <Switch label="Active (visible)" checked={form.active} onChange={v => setForm({ ...form, active: v })} />
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
        <ErrorState title="Could not load testimonials" error={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState icon={Quote} text="Add real client quotes here — the Testimonials section on the website stays hidden until you add one." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(t => (
            <div key={t.id} className="card p-5 flex flex-col" style={{ opacity: t.active ? 1 : 0.6 }}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink text-sm">{t.name}</p>
                  {t.role && <p className="text-xs text-mute">{t.role}</p>}
                </div>
                <button onClick={() => toggleActive(t)} disabled={busyId === t.id}
                        aria-label={`${t.active ? "Hide" : "Show"} testimonial from ${t.name}`}
                        className={`badge ${t.active ? "badge-paid" : "badge-cancelled"} ${FOCUS}`}>
                  {t.active ? "Live" : "Hidden"}
                </button>
              </div>
              <p className="text-sm text-ink-2 leading-relaxed mb-4 line-clamp-5">“{t.text}”</p>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => openEdit(t)}
                        className={`btn btn-ghost btn-sm flex-1 inline-flex items-center justify-center gap-1 ${FOCUS}`}>
                  <Pencil size={12} aria-hidden="true" /> Edit
                </button>
                <button onClick={() => remove(t)} disabled={busyId === t.id} aria-label={`Delete testimonial from ${t.name}`}
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
