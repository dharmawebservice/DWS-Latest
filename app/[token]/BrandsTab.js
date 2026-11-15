"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Pencil, Trash2, Tag, ExternalLink, Upload, X, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, Type, List, Hash, Images, Quote as QuoteIcon, Star, Home,
} from "lucide-react";
import {
  adminFetch, api, LoadingState, EmptyState, ErrorState, Modal, ModalHeader, Switch, FOCUS,
} from "./ui";
import { LIMITS } from "@/lib/blocks";

/* ── Brands & Projects tab ────────────────────────────────────────────────────
   One list feeds three places on the public site: the "Trusted by" logo strip,
   the project cards (Work page + Home) and the page each card opens. Everything
   about a project, including its extra page sections, is edited here. */

const WORK_KEYS = ["category", "summary", "result", "tags", "image_url", "case_study"];
// Fields added by the project-page upgrade, with their "nothing set" value.
const NEW_DEFAULTS = {
  client_name: "", year: "", timeline: "", services: "",
  show_card: true, show_logo: true, show_stack: true, is_hero: false,
};

const EMPTY_BRAND = {
  name: "", logo_url: "", website_url: "", display_order: 0, active: true,
  category: "", summary: "", result: "", tags: "", image_url: "", case_study: "", featured: false,
  ...NEW_DEFAULTS,
  blocks: [],
};

const uid = () => Math.random().toString(36).slice(2, 9);

/* ── Image upload (auto-resizes to a crisp WebP before sending) ───────────── */
async function prepareImage(file, maxW) {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const targetW = Math.min(bmp.width, maxW);
    const targetH = Math.max(1, Math.round((bmp.height * targetW) / bmp.width));
    const draw = (src, w, h) => {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(src, 0, 0, w, h);
      return c;
    };
    // Shrinking in halves keeps small text sharp when a big screenshot is scaled down a lot.
    let src = bmp, cw = bmp.width, ch = bmp.height;
    while (cw / 2 >= targetW) {
      const nw = Math.round(cw / 2), nh = Math.round(ch / 2);
      src = draw(src, nw, nh); cw = nw; ch = nh;
    }
    const out = draw(src, targetW, targetH);
    const blob = await new Promise((res) => out.toBlob(res, "image/webp", 0.92));
    if (!blob || blob.type !== "image/webp") return file;
    if (blob.size >= file.size && bmp.width <= maxW) return file;
    const base = (file.name.replace(/\.[^.]+$/, "") || "image").slice(0, 40);
    return new File([blob], `${base}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

async function uploadImage(file, maxW) {
  const prepared = await prepareImage(file, maxW);
  const fd = new FormData();
  fd.append("file", prepared);
  try {
    const res = await adminFetch("/api/admin/brands/upload", { method: "POST", body: fd });
    let data = {};
    try { data = await res.json(); } catch {}
    if (!res.ok) {
      return { error: res.status === 401 ? "Your session expired. Reload the page and log in again." : data.error || `Upload failed (HTTP ${res.status})` };
    }
    return { url: data.url };
  } catch {
    return { error: "Could not reach the server. Check your connection." };
  }
}

function UploadButton({ onFiles, busy, multiple = false, children }) {
  return (
    <label className={`btn btn-ghost btn-sm inline-flex shrink-0 cursor-pointer items-center gap-1.5 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${busy ? "pointer-events-none opacity-60" : ""}`}>
      {busy ? <><span className="spinner" /> Uploading…</> : <><Upload size={13} aria-hidden="true" /> {children}</>}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple={multiple}
        disabled={busy}
        className="sr-only"
        onChange={(e) => {
          const files = [...(e.target.files || [])];
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </label>
  );
}

function ImageField({ id, label, value, onChange, maxW = 1800, placeholder = "Paste an image link, or upload", hint, previewClass = "h-28" }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const pick = async (files) => {
    setBusy(true); setErr("");
    const r = await uploadImage(files[0], maxW);
    setBusy(false);
    if (r.error) setErr(r.error); else onChange(r.url);
  };
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <div className="flex gap-2">
        <input id={id} className="admin-input" maxLength={1000} placeholder={placeholder}
               value={value} onChange={(e) => onChange(e.target.value)} />
        <UploadButton onFiles={pick} busy={busy}>Upload</UploadButton>
      </div>
      {hint && <p className="mt-1.5 text-xs text-mute">{hint}</p>}
      {err && <p className="mt-1.5 text-xs text-bad" role="alert">{err}</p>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className={`mt-2 ${previewClass} w-auto max-w-full rounded border border-line object-contain`}
             onError={(e) => { e.currentTarget.style.display = "none"; }} onLoad={(e) => { e.currentTarget.style.display = ""; }} />
      )}
    </div>
  );
}

/* ── Page-section (block) editor ──────────────────────────────────────────── */
const BLOCK_META = {
  text:    { label: "Text section", Icon: Type,      hint: "A heading and paragraphs, e.g. The challenge, Our approach." },
  list:    { label: "Bullet list",  Icon: List,      hint: "Key features or deliverables, one per line." },
  stats:   { label: "Numbers",      Icon: Hash,      hint: "Big figures such as '7 days' or '3 languages'." },
  gallery: { label: "Image gallery", Icon: Images,   hint: "Screenshots or photos, uploaded here." },
  quote:   { label: "Client quote", Icon: QuoteIcon, hint: "A short testimonial from the client." },
};

function newBlock(type) {
  const id = uid();
  if (type === "text") return { id, type, heading: "", body: "" };
  if (type === "list") return { id, type, heading: "", itemsText: "" };
  if (type === "stats") return { id, type, heading: "", items: [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }] };
  if (type === "gallery") return { id, type, heading: "", images: [] };
  return { id, type: "quote", text: "", author: "", role: "" };
}

// Saved blocks -> editable blocks (a list's items become one line each).
const blocksToEditor = (blocks) =>
  (Array.isArray(blocks) ? blocks : []).map((b) =>
    b?.type === "list" ? { ...b, itemsText: (b.items || []).join("\n") } : { ...b });

// Editable blocks -> what the API expects. Empty ones are dropped.
const blocksToApi = (blocks) =>
  blocks.map((b) => {
    if (b.type === "list") {
      const { itemsText, ...rest } = b;
      return { ...rest, items: String(itemsText || "").split("\n") };
    }
    return b;
  });

function IconBtn({ label, onClick, disabled, danger, children }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}
            className={`rounded p-1.5 hover:bg-sand disabled:opacity-30 disabled:hover:bg-transparent ${danger ? "text-bad" : "text-mute hover:text-ink"} ${FOCUS}`}>
      {children}
    </button>
  );
}

function BlockEditor({ block, index, total, onChange, onMove, onRemove }) {
  const meta = BLOCK_META[block.type];
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (patch) => onChange({ ...block, ...patch });
  const fid = (n) => `blk-${block.id}-${n}`;

  const addImages = async (files) => {
    setBusy(true); setErr("");
    const room = LIMITS.images - block.images.length;
    const added = [];
    for (const f of files.slice(0, Math.max(0, room))) {
      const r = await uploadImage(f, 1800);
      if (r.error) { setErr(r.error); break; }
      added.push({ url: r.url, caption: "" });
    }
    if (added.length) set({ images: [...block.images, ...added] });
    if (files.length > room) setErr(`A gallery holds up to ${LIMITS.images} images.`);
    setBusy(false);
  };

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <meta.Icon size={15} aria-hidden="true" /> {meta.label}
          <span className="font-normal text-mute">· section {index + 1}</span>
        </p>
        <div className="flex items-center">
          <IconBtn label="Move section up" onClick={() => onMove(-1)} disabled={index === 0}><ArrowUp size={15} aria-hidden="true" /></IconBtn>
          <IconBtn label="Move section down" onClick={() => onMove(1)} disabled={index === total - 1}><ArrowDown size={15} aria-hidden="true" /></IconBtn>
          <IconBtn label="Delete section" onClick={onRemove} danger><Trash2 size={15} aria-hidden="true" /></IconBtn>
        </div>
      </div>

      <div className="space-y-3">
        {block.type !== "quote" && (
          <div>
            <label htmlFor={fid("h")} className="field-label">{block.type === "stats" || block.type === "gallery" ? "Heading (optional)" : "Heading"}</label>
            <input id={fid("h")} className="admin-input" maxLength={LIMITS.heading} value={block.heading}
                   placeholder={block.type === "text" ? "e.g. The challenge" : block.type === "list" ? "e.g. What we delivered" : ""}
                   onChange={(e) => set({ heading: e.target.value })} />
          </div>
        )}

        {block.type === "text" && (
          <div>
            <label htmlFor={fid("b")} className="field-label">Text</label>
            <textarea id={fid("b")} rows={6} maxLength={LIMITS.body} className="admin-input" value={block.body}
                      onChange={(e) => set({ body: e.target.value })} />
            <p className="mt-1 text-xs text-mute">Leave a blank line between paragraphs.</p>
          </div>
        )}

        {block.type === "list" && (
          <div>
            <label htmlFor={fid("i")} className="field-label">Items (one per line, up to {LIMITS.listItems})</label>
            <textarea id={fid("i")} rows={6} className="admin-input" value={block.itemsText}
                      onChange={(e) => set({ itemsText: e.target.value })} />
          </div>
        )}

        {block.type === "stats" && (
          <div className="space-y-2">
            {block.items.map((it, i) => (
              <div key={i} className="grid grid-cols-[7rem_1fr_auto] items-end gap-2">
                <div>
                  <label htmlFor={fid(`v${i}`)} className="field-label">Figure</label>
                  <input id={fid(`v${i}`)} className="admin-input" maxLength={LIMITS.statValue} placeholder="7 days" value={it.value}
                         onChange={(e) => set({ items: block.items.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
                </div>
                <div>
                  <label htmlFor={fid(`l${i}`)} className="field-label">Label</label>
                  <input id={fid(`l${i}`)} className="admin-input" maxLength={LIMITS.statLabel} placeholder="Delivery time" value={it.label}
                         onChange={(e) => set({ items: block.items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                </div>
                <IconBtn label="Remove this figure" onClick={() => set({ items: block.items.filter((_, j) => j !== i) })} danger><X size={15} aria-hidden="true" /></IconBtn>
              </div>
            ))}
            {block.items.length < LIMITS.stats && (
              <button type="button" onClick={() => set({ items: [...block.items, { value: "", label: "" }] })}
                      className={`btn btn-ghost btn-sm inline-flex items-center gap-1.5 ${FOCUS}`}>
                <Plus size={13} aria-hidden="true" /> Add figure
              </button>
            )}
          </div>
        )}

        {block.type === "gallery" && (
          <div className="space-y-3">
            {block.images.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {block.images.map((im, i) => (
                  <li key={`${im.url}-${i}`} className="rounded border border-line bg-paper p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={im.url} alt="" className="aspect-[16/10] w-full rounded-sm bg-sand object-cover object-top" />
                    <div className="mt-2 flex items-center gap-1">
                      <input aria-label={`Caption for image ${i + 1}`} className="admin-input" maxLength={LIMITS.caption} placeholder="Caption (optional)"
                             value={im.caption} onChange={(e) => set({ images: block.images.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)) })} />
                      <IconBtn label="Move image earlier" disabled={i === 0}
                               onClick={() => { const a = [...block.images]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; set({ images: a }); }}><ChevronLeft size={15} aria-hidden="true" /></IconBtn>
                      <IconBtn label="Move image later" disabled={i === block.images.length - 1}
                               onClick={() => { const a = [...block.images]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; set({ images: a }); }}><ChevronRight size={15} aria-hidden="true" /></IconBtn>
                      <IconBtn label="Remove image" danger onClick={() => set({ images: block.images.filter((_, j) => j !== i) })}><X size={15} aria-hidden="true" /></IconBtn>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <UploadButton onFiles={addImages} busy={busy} multiple>Upload images</UploadButton>
              <span className="text-xs text-mute">{block.images.length}/{LIMITS.images} · big screenshots are shrunk to a sharp WebP automatically</span>
            </div>
            {err && <p className="text-xs text-bad" role="alert">{err}</p>}
          </div>
        )}

        {block.type === "quote" && (
          <>
            <div>
              <label htmlFor={fid("q")} className="field-label">Quote</label>
              <textarea id={fid("q")} rows={3} maxLength={LIMITS.quote} className="admin-input" value={block.text}
                        onChange={(e) => set({ text: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={fid("a")} className="field-label">Name</label>
                <input id={fid("a")} className="admin-input" maxLength={LIMITS.person} value={block.author}
                       onChange={(e) => set({ author: e.target.value })} />
              </div>
              <div>
                <label htmlFor={fid("r")} className="field-label">Role / company</label>
                <input id={fid("r")} className="admin-input" maxLength={LIMITS.person} value={block.role}
                       onChange={(e) => set({ role: e.target.value })} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Tab ──────────────────────────────────────────────────────────────────── */
export default function BrandsTab() {
  const [brands,    setBrands]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [form,      setForm]      = useState(EMPTY_BRAND);
  const [saving,    setSaving]    = useState(false);
  const [saveErr,   setSaveErr]   = useState("");
  const [moving,    setMoving]    = useState(false);
  const snapshot = useRef("");

  const loadBrands = useCallback(async () => {
    setLoading(true); setError("");
    const r = await api("/api/admin/brands");
    if (r.ok) setBrands(Array.isArray(r.data) ? r.data : []);
    else setError(r.error);
    setLoading(false);
  }, []);
  useEffect(() => { loadBrands(); }, [loadBrands]);

  const dirty = showForm && JSON.stringify(form) !== snapshot.current;
  const closeForm = () => { setShowForm(false); setEditBrand(null); setSaveErr(""); };
  const requestClose = () => {
    if (dirty && !confirm("Discard your unsaved changes?")) return;
    closeForm();
  };

  const openForm = (brand, next) => {
    setEditBrand(brand); setSaveErr("");
    setForm(next);
    snapshot.current = JSON.stringify(next);
    setShowForm(true);
  };

  const openNew = () => openForm(null, { ...EMPTY_BRAND, display_order: brands.length });

  const openEdit = (b) => openForm(b, {
    name: b.name || "", logo_url: b.logo_url || "", website_url: b.website_url || "",
    display_order: b.display_order ?? 0, active: b.active !== false,
    category: b.category || "", summary: b.summary || "", result: b.result || "",
    tags: b.tags || "", image_url: b.image_url || "", case_study: b.case_study || "",
    featured: !!b.featured,
    client_name: b.client_name || "", year: b.year || "", timeline: b.timeline || "", services: b.services || "",
    show_card: b.show_card !== false, show_logo: b.show_logo !== false,
    show_stack: b.show_stack !== false, is_hero: b.is_hero === true,
    blocks: blocksToEditor(b.blocks),
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true); setSaveErr("");
    const body = { ...form, display_order: Number(form.display_order) || 0, blocks: blocksToApi(form.blocks) };
    // Before the database upgrade is run, old rows have none of the newer columns: only send
    // a field if the row already has it, or the owner actually changed it from its default.
    const optional = [...WORK_KEYS, "featured", ...Object.keys(NEW_DEFAULTS), "blocks"];
    for (const k of optional) {
      const v = body[k];
      let isDefault;
      if (k === "blocks") isDefault = !v.some((b) => b && (b.heading || b.body || b.text || (b.items && b.items.length) || (b.images && b.images.length)));
      else if (k === "featured") isDefault = v !== true;
      else if (typeof NEW_DEFAULTS[k] === "boolean") isDefault = v === NEW_DEFAULTS[k];
      else isDefault = String(v || "").trim() === "";
      if (editBrand ? !(k in editBrand) && isDefault : isDefault) delete body[k];
    }
    const r = await api("/api/admin/brands", {
      method: editBrand ? "PATCH" : "POST",
      body: editBrand ? { ...body, id: editBrand.id } : body,
    });
    setSaving(false);
    if (!r.ok) { setSaveErr(r.error); return; }
    closeForm(); loadBrands();
  };

  const handleToggle = async (brand) => {
    const r = await api("/api/admin/brands", { method: "PATCH", body: { id: brand.id, active: !brand.active } });
    if (!r.ok) setError(r.error); else loadBrands();
  };

  const handleDelete = async (brand) => {
    if (!confirm(`Delete "${brand.name}"? Its card, its page and its uploaded images are removed. This cannot be undone.`)) return;
    const r = await api("/api/admin/brands", { method: "DELETE", body: { id: brand.id } });
    if (!r.ok) setError(r.error); else loadBrands();
  };

  // Swap with the neighbour, then save a clean 0..n order.
  const move = async (index, dir) => {
    const j = index + dir;
    if (moving || j < 0 || j >= brands.length) return;
    const next = [...brands];
    [next[index], next[j]] = [next[j], next[index]];
    setBrands(next);
    setMoving(true); setError("");
    for (let i = 0; i < next.length; i++) {
      if (next[i].display_order === i) continue;
      const r = await api("/api/admin/brands", { method: "PATCH", body: { id: next[i].id, display_order: i } });
      if (!r.ok) { setError(r.error); break; }
    }
    setMoving(false);
    loadBrands();
  };

  const setF = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setBlock = (i, b) => setF({ blocks: form.blocks.map((x, j) => (j === i ? b : x)) });
  const moveBlock = (i, dir) => {
    const a = [...form.blocks]; const j = i + dir;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    setF({ blocks: a });
  };
  const removeBlock = (i) => {
    const b = form.blocks[i];
    const hasContent = b.heading || b.body || b.text || b.itemsText || b.images?.length || b.items?.some?.((x) => x.value || x.label);
    if (hasContent && !confirm("Delete this section?")) return;
    setF({ blocks: form.blocks.filter((_, j) => j !== i) });
  };
  const addBlock = (type) => {
    if (form.blocks.length >= LIMITS.blocks) return;
    setF({ blocks: [...form.blocks, newBlock(type)] });
  };

  const d = editBrand?._defaults || {};

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-mute">{brands.length} {brands.length === 1 ? "project" : "projects"} · use the arrows to change the order on the site</p>
        <button onClick={openNew} className={`btn btn-primary btn-sm inline-flex items-center gap-1.5 ${FOCUS}`}>
          <Plus size={14} aria-hidden="true" /> Add project
        </button>
      </div>

      {showForm && (
        <Modal onClose={requestClose} maxWidth="max-w-3xl" label={editBrand ? "Edit project" : "Add project"}>
          <ModalHeader title={editBrand ? `Edit ${editBrand.name}` : "Add project"} onClose={requestClose} />
          <form onSubmit={handleSave} className="space-y-4">
            {/* 1 · Basics */}
            <fieldset className="panel space-y-3 p-4">
              <legend className="eyebrow px-1">Basics</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="brand-name" className="field-label">Name *</label>
                  <input id="brand-name" required maxLength={120} className="admin-input" value={form.name}
                         onChange={(e) => setF({ name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="brand-website_url" className="field-label">Website URL *</label>
                  <input id="brand-website_url" required type="url" placeholder="https://" className="admin-input" value={form.website_url}
                         onChange={(e) => setF({ website_url: e.target.value })} />
                </div>
              </div>
              <ImageField id="brand-logo_url" label="Logo" value={form.logo_url} maxW={800} previewClass="h-10"
                          hint="Used in the “Trusted by” strip and as the card picture when there is no screenshot."
                          onChange={(v) => setF({ logo_url: v })} />
              <Switch checked={form.active} onChange={(v) => setF({ active: v })} label="Live on the site" />
            </fieldset>

            {/* 2 · Where it appears */}
            <fieldset className="panel space-y-3 p-4">
              <legend className="eyebrow px-1">Where it appears</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <Switch checked={form.show_card} onChange={(v) => setF({ show_card: v })} label="Project card (Work page + Home)" />
                <Switch checked={form.show_logo} onChange={(v) => setF({ show_logo: v })} label="“Trusted by” logo strip" />
                <Switch checked={form.featured} onChange={(v) => setF({ featured: v })} label="Featured (first on Home)" />
                <Switch checked={form.is_hero} onChange={(v) => setF({ is_hero: v })} label="Image beside the Home headline" />
              </div>
              <p className="text-xs text-mute">
                The Home headline image can show a project even when its card is switched off. Only one project can hold it: choosing it here releases the previous one.
              </p>
            </fieldset>

            {/* 3 · Card + page intro */}
            <fieldset className="panel space-y-3 p-4">
              <legend className="eyebrow px-1">Card and page introduction</legend>
              <p className="text-xs text-mute">A project gets its own page once it has a summary or any page section. Empty fields use the built-in text shown in grey.</p>
              <ImageField id="brand-image_url" label="Cover screenshot" value={form.image_url} maxW={1800}
                          placeholder={d.image ? `Built-in image in use: ${d.image}` : "Paste an image link, or upload"}
                          hint="Any size works: it is shrunk to a sharp WebP (1800px wide) when you upload."
                          onChange={(v) => setF({ image_url: v })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="brand-category" className="field-label">Category</label>
                  <input id="brand-category" className="admin-input" maxLength={120} placeholder={d.category || "e.g. E-commerce"}
                         value={form.category} onChange={(e) => setF({ category: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="brand-tags" className="field-label">Tags (comma separated)</label>
                  <input id="brand-tags" className="admin-input" maxLength={300} placeholder={d.tags || "Next.js, Supabase"}
                         value={form.tags} onChange={(e) => setF({ tags: e.target.value })} />
                </div>
              </div>
              <div>
                <label htmlFor="brand-summary" className="field-label">Summary (shown on the card and at the top of the page)</label>
                <textarea id="brand-summary" rows={2} className="admin-input" maxLength={500} placeholder={d.summary || ""}
                          value={form.summary} onChange={(e) => setF({ summary: e.target.value })} />
              </div>
              <div>
                <label htmlFor="brand-result" className="field-label">Result / outcome (optional)</label>
                <input id="brand-result" className="admin-input" maxLength={500}
                       value={form.result} onChange={(e) => setF({ result: e.target.value })} />
              </div>
              <div>
                <label htmlFor="brand-case_study" className="field-label">Intro story (optional, paragraphs separated by a blank line)</label>
                <textarea id="brand-case_study" rows={4} maxLength={20000} className="admin-input"
                          value={form.case_study} onChange={(e) => setF({ case_study: e.target.value })} />
              </div>
              <Switch checked={form.show_stack} onChange={(v) => setF({ show_stack: v })} label="Show the “Built with” tags on the project page" />
            </fieldset>

            {/* 4 · Facts */}
            <fieldset className="panel space-y-3 p-4">
              <legend className="eyebrow px-1">Project facts (the card beside the story)</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="brand-client_name" className="field-label">Client</label>
                  <input id="brand-client_name" className="admin-input" maxLength={120} value={form.client_name}
                         onChange={(e) => setF({ client_name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="brand-year" className="field-label">Year</label>
                  <input id="brand-year" className="admin-input" maxLength={20} placeholder="2026" value={form.year}
                         onChange={(e) => setF({ year: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="brand-timeline" className="field-label">Timeline</label>
                  <input id="brand-timeline" className="admin-input" maxLength={120} placeholder="2 weeks" value={form.timeline}
                         onChange={(e) => setF({ timeline: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="brand-services" className="field-label">What we did (comma separated)</label>
                  <input id="brand-services" className="admin-input" maxLength={300} placeholder="Design, Development, SEO" value={form.services}
                         onChange={(e) => setF({ services: e.target.value })} />
                </div>
              </div>
            </fieldset>

            {/* 5 · Page sections */}
            <fieldset className="panel space-y-3 p-4">
              <legend className="eyebrow px-1">Page sections</legend>
              <p className="text-xs text-mute">
                Add as many as you like and put them in any order. They appear on the project page below the screenshot.
                Tip: show results and visuals. Keep client-private details and technical how-tos off public pages.
              </p>
              {form.blocks.length === 0 && (
                <p className="rounded border border-dashed border-line-2 bg-paper px-3 py-4 text-center text-sm text-mute">No sections yet. Add one below.</p>
              )}
              <div className="space-y-3">
                {form.blocks.map((b, i) => (
                  <BlockEditor key={b.id} block={b} index={i} total={form.blocks.length}
                               onChange={(nb) => setBlock(i, nb)} onMove={(dir) => moveBlock(i, dir)} onRemove={() => removeBlock(i)} />
                ))}
              </div>
              {form.blocks.length < LIMITS.blocks ? (
                <div>
                  <p className="field-label">Add a section</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(BLOCK_META).map(([type, m]) => (
                      <button key={type} type="button" onClick={() => addBlock(type)} title={m.hint}
                              className={`btn btn-ghost btn-sm inline-flex items-center gap-1.5 ${FOCUS}`}>
                        <m.Icon size={13} aria-hidden="true" /> {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-mute">You have reached the limit of {LIMITS.blocks} sections.</p>
              )}
            </fieldset>

            {saveErr && <p className="rounded-lg bg-sand px-3 py-2 text-sm text-bad" role="alert">{saveErr}</p>}
            <div className="sticky bottom-0 -mx-6 -mb-6 flex gap-3 border-t border-line bg-paper px-6 py-4">
              <button type="submit" disabled={saving}
                      className={`btn btn-primary flex flex-1 items-center justify-center gap-2 disabled:opacity-60 ${FOCUS}`}>
                {saving ? <><span className="spinner" /> Saving…</> : "Save project"}
              </button>
              <button type="button" onClick={requestClose} className={`btn btn-ghost flex-1 ${FOCUS}`}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {error && !loading && brands.length > 0 && <p className="mb-4 text-sm text-bad" role="alert">{error}</p>}

      {loading ? (
        <LoadingState />
      ) : error && brands.length === 0 ? (
        <ErrorState title="Could not load projects" error={error} onRetry={loadBrands} />
      ) : brands.length === 0 ? (
        <EmptyState icon={Tag} text="No projects yet. Add your first one." />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand, i) => {
            const cover = (brand.image_url || "").trim() || brand._defaults?.image || "";
            return (
              <li key={brand.id} className="card flex flex-col overflow-hidden transition-opacity" style={{ opacity: brand.active ? 1 : 0.6 }}>
                <div className="relative aspect-[16/10] border-b border-line bg-sand">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-full w-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  ) : brand.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brand.logo_url} alt="" className="absolute inset-0 m-auto max-h-14 max-w-[60%] object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  ) : null}
                  <button onClick={() => handleToggle(brand)} aria-label={`${brand.active ? "Hide" : "Show"} ${brand.name}`}
                          className={`badge absolute right-3 top-3 ${brand.active ? "badge-paid" : "badge-cancelled"} ${FOCUS}`}>
                    {brand.active ? "Live" : "Hidden"}
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm font-semibold text-ink">{brand.name}</p>
                  <a href={brand.website_url} target="_blank" rel="noopener noreferrer"
                     className={`mb-3 block truncate rounded text-xs text-mute underline-offset-2 hover:text-ink hover:underline ${FOCUS}`}>
                    {brand.website_url}
                  </a>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {brand.show_card !== false && <span className="badge badge-partial">Card</span>}
                    {brand.show_logo !== false && brand.logo_url && <span className="badge badge-partial">Logo</span>}
                    {brand._has_page && <span className="badge badge-paid">Page</span>}
                    {brand.is_hero && <span className="badge badge-pending inline-flex items-center gap-1"><Home size={11} aria-hidden="true" /> Home image</span>}
                    {brand.featured && <span className="badge badge-pending inline-flex items-center gap-1"><Star size={11} aria-hidden="true" /> Featured</span>}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    <button onClick={() => openEdit(brand)} className={`btn btn-ghost btn-sm inline-flex flex-1 items-center justify-center gap-1 ${FOCUS}`}>
                      <Pencil size={12} aria-hidden="true" /> Edit
                    </button>
                    {brand._has_page && (
                      <a href={`/work/${brand._slug}`} target="_blank" rel="noopener noreferrer"
                         className={`btn btn-ghost btn-sm inline-flex items-center justify-center gap-1 ${FOCUS}`} aria-label={`View ${brand.name} page`}>
                        <ExternalLink size={12} aria-hidden="true" /> View
                      </a>
                    )}
                    <div className="flex items-center">
                      <IconBtn label={`Move ${brand.name} earlier`} onClick={() => move(i, -1)} disabled={moving || i === 0}><ChevronLeft size={16} aria-hidden="true" /></IconBtn>
                      <IconBtn label={`Move ${brand.name} later`} onClick={() => move(i, 1)} disabled={moving || i === brands.length - 1}><ChevronRight size={16} aria-hidden="true" /></IconBtn>
                      <IconBtn label={`Delete ${brand.name}`} onClick={() => handleDelete(brand)} danger><Trash2 size={15} aria-hidden="true" /></IconBtn>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
