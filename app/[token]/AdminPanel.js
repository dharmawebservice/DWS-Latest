"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Receipt, Tag, Mail, BarChart3, LogOut, Plus, Pencil, Trash2, X,
  RefreshCw, Lock, ExternalLink, Inbox, Radio, Check, Reply,
  Package, Quote, Link2, FileText,
} from "lucide-react";
import {
  adminFetch, api, LoadingState, EmptyState, ErrorState, Modal, ModalHeader, FOCUS,
} from "./ui";
import PackagesTab from "./PackagesTab";
import TestimonialsTab from "./TestimonialsTab";
import OnboardingTab from "./OnboardingTab";
import dynamic from "next/dynamic";
const DocumentsTab = dynamic(() => import("./DocumentsTab"), { ssr: false, loading: () => <LoadingState text="Loading documents…" /> });

/* ── helpers ─────────────────────────────────────────────────────────────── */
function fmt(n) { return Number(n || 0).toLocaleString("en-IN"); }

/* ── Login ───────────────────────────────────────────────────────────────── */
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await adminFetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) onLogin();
    else if (res.status === 429) setError("Too many attempts. Please wait a few minutes and try again.");
    else setError("Incorrect password. Try again.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <div className="card w-full max-w-sm p-8 sm:p-10">
        <div className="text-center mb-7">
          <img src="/dws-mark.png" alt="Dharma Web Services"
               className="h-10 w-auto object-contain mx-auto mb-5" />
          <h1 className="font-display text-4xl font-normal text-ink">Dharma Vault</h1>
          <p className="text-sm mt-2 text-mute">
            Private workspace for Dharma Web Services
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="vault-password" className="field-label">
              <span className="inline-flex items-center gap-1.5"><Lock size={12} aria-hidden="true" /> Password</span>
            </label>
            <input id="vault-password" type="password" placeholder="Enter password" value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="field" autoFocus required />
          </div>
          {error && <p className="text-bad text-sm" role="alert">{error}</p>}
          <button type="submit" disabled={loading}
                  className="btn btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><span className="spinner" /> Verifying…</> : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[11px] uppercase tracking-wider text-mute font-medium">{label}</p>
        {Icon && <span className="icon-tile"><Icon size={16} aria-hidden="true" /></span>}
      </div>
      <p className="font-display text-3xl sm:text-4xl font-normal text-ink leading-tight">{value}</p>
      {sub && <p className="text-xs mt-1 text-mute">{sub}</p>}
    </div>
  );
}

/* ── Bar Chart ───────────────────────────────────────────────────────────── */
function BarChart({ data = [] }) {
  if (!data.length) return null;
  const visible = data.slice(-30);
  const max     = Math.max(...visible.map(d => d.unique), 1);

  return (
    <div className="flex items-end gap-[2px] sm:gap-[3px] h-24 w-full border-b border-line">
      {visible.map((d, i) => {
        const pct      = Math.max((d.unique / max) * 100, d.unique > 0 ? 6 : 2);
        const isToday  = i === visible.length - 1;
        const isWeekend = new Date(d.date).getDay() % 6 === 0;
        return (
          <div key={d.date} className="relative group flex-1 flex flex-col justify-end h-full">
            <div style={{
              height: `${pct}%`,
              background: isToday ? "#b68a2e" : isWeekend ? "#d6d1c3" : "#14213d",
              borderRadius: "2px 2px 0 0",
              transition: "background 0.2s",
              minHeight: d.unique > 0 ? "4px" : "2px",
            }} />
            {/* tooltip */}
            <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-20 px-2 py-1
                            rounded-lg border border-line bg-paper shadow-soft whitespace-nowrap text-[11px] text-ink
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {d.label}: <span className="font-semibold">{d.unique}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Visitors Tab ─────────────────────────────────────────────────────────── */
function VisitorsTab() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const loadStats = async () => {
    setLoading(true); setError(null);
    try {
      const res = await adminFetch("/api/admin/visits");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  if (loading) return <LoadingState text="Loading analytics…" />;

  if (error) return (
    <div className="space-y-4">
      <div className="card p-6 text-center">
        <p className="text-bad font-medium mb-1">Could not load visitor data</p>
        <p className="text-sm text-mute">{error}</p>
        <button onClick={loadStats}
                className={`btn btn-ghost btn-sm mt-4 ${FOCUS}`}>
          Try Again
        </button>
      </div>
      <SetupGuide />
    </div>
  );

  const trend = stats.yesterdayUnique > 0
    ? (((stats.todayUnique - stats.yesterdayUnique) / stats.yesterdayUnique) * 100).toFixed(0)
    : null;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Visitors" value={fmt(stats.todayUnique)} icon={BarChart3}
          sub={trend !== null ? `${trend >= 0 ? "+" : ""}${trend}% vs yesterday` : "First day tracked"} />
        <StatCard label="Yesterday" value={fmt(stats.yesterdayUnique)} sub="Unique visitors" />
        <StatCard label="Last 30 Days" value={fmt(stats.last30Unique)} sub="Unique visitors" />
        <StatCard label="All-Time Hits" value={fmt(stats.totalHits)} sub="Total page loads" />
      </div>

      {/* Chart */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5 gap-3">
          <div>
            <h3 className="font-display text-2xl font-normal text-ink">Daily Unique Visitors</h3>
            <p className="text-xs mt-0.5 text-mute">Last 30 days</p>
          </div>
          <button onClick={loadStats}
                  className={`btn btn-ghost btn-sm inline-flex items-center gap-1.5 ${FOCUS}`}>
            <RefreshCw size={13} aria-hidden="true" /> Refresh
          </button>
        </div>
        <BarChart data={stats.daily} />
        {stats.daily?.length > 0 && (
          <div className="flex justify-between mt-2 text-[10px] text-mute">
            <span>{stats.daily[0]?.label}</span>
            <span>{stats.daily[Math.floor(stats.daily.length / 2)]?.label}</span>
            <span>{stats.daily[stats.daily.length - 1]?.label} (today)</span>
          </div>
        )}
        {/* Legend */}
        <div className="flex gap-4 mt-4 text-[11px] text-mute">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm inline-block" style={{ background: "#b68a2e" }} />
            Today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm inline-block" style={{ background: "#d6d1c3" }} />
            Weekend
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm inline-block" style={{ background: "#14213d" }} />
            Weekday
          </span>
        </div>
      </div>

      {/* Top pages */}
      {stats.topPages?.length > 0 && (
        <div className="card p-5 sm:p-6">
          <h3 className="font-display text-2xl font-normal text-ink mb-4">Top Pages Today</h3>
          <div className="space-y-3">
            {stats.topPages.map(({ path, count }) => {
              const maxCount = stats.topPages[0]?.count || 1;
              return (
                <div key={path}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ink-2">{path || "/"}</span>
                    <span className="font-semibold text-ink">{count}</span>
                  </div>
                  <div className="rounded-full h-1.5 w-full bg-sand">
                    <div className="h-1.5 rounded-full"
                         style={{ width: `${(count / maxCount) * 100}%`, background: "linear-gradient(90deg,#b68a2e,#0f1115)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily table */}
      <div>
        <h3 className="font-display text-2xl font-normal text-ink mb-3">Daily Breakdown — Last 30 Days</h3>
        <div className="card overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Unique Visitors</th>
                <th className="w-40">Bar</th>
              </tr>
            </thead>
            <tbody>
              {[...stats.daily].reverse().map(d => {
                const maxU    = Math.max(...stats.daily.map(x => x.unique), 1);
                const pct     = (d.unique / maxU) * 100;
                const isToday = d.date === new Date().toISOString().split("T")[0];
                return (
                  <tr key={d.date}>
                    <td className="text-sm text-ink-2">
                      {d.label}
                      {isToday && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-gold-soft text-gold-ink font-medium">
                          today
                        </span>
                      )}
                    </td>
                    <td className="font-semibold text-ink text-sm">{d.unique}</td>
                    <td>
                      <div className="rounded-full h-1.5 w-full bg-sand">
                        <div className="h-1.5 rounded-full transition-all"
                             style={{
                               width: `${pct}%`,
                               background: isToday ? "#b68a2e" : "#14213d",
                             }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SetupGuide />
    </div>
  );
}

function SetupGuide() {
  return (
    <div className="panel p-5">
      <p className="eyebrow flex items-center gap-1.5 mb-2">
        <Radio size={13} aria-hidden="true" /> Visitor Tracking Setup
      </p>
      <p className="text-xs leading-relaxed mb-3 text-ink-2">
        1. Run the SQL below in your Supabase SQL editor to create the table.
        <br />2. Add the tracking call to your <code className="px-1 rounded text-xs bg-paper border border-line text-ink">layout.js</code>.
      </p>
      <details className="group">
        <summary className={`text-xs cursor-pointer font-medium text-gold-ink rounded ${FOCUS}`}>
          Show SQL Migration
        </summary>
        <pre className="mt-3 p-3 rounded-xl overflow-x-auto text-[11px] leading-relaxed bg-paper border border-line text-ink-2">
{`CREATE TABLE IF NOT EXISTS page_visits (
  id           bigserial PRIMARY KEY,
  visitor_ip   text NOT NULL,
  visit_date   date NOT NULL DEFAULT CURRENT_DATE,
  page_path    text NOT NULL DEFAULT '/',
  user_agent   text,
  hit_count    int  NOT NULL DEFAULT 1,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (visitor_ip, visit_date, page_path)
);

CREATE INDEX IF NOT EXISTS idx_visits_date
  ON page_visits (visit_date DESC);

-- Enable Row Level Security but allow service role full access
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;`}
        </pre>
      </details>
      <details className="group mt-3">
        <summary className={`text-xs cursor-pointer font-medium text-gold-ink rounded ${FOCUS}`}>
          Show layout.js tracking call
        </summary>
        <pre className="mt-3 p-3 rounded-xl overflow-x-auto text-[11px] leading-relaxed bg-paper border border-line text-ink-2">
{`// Add this to your app/layout.js inside a useEffect
// (wrap in a Client Component or inline script)
useEffect(() => {
  fetch('/api/visits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: window.location.pathname }),
  }).catch(() => {});
}, []);`}
        </pre>
      </details>
    </div>
  );
}

/* ── Transactions Tab ─────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  client_name: "", client_email: "", client_phone: "",
  service_type: "Website", package_name: "Pro",
  amount: "", payment_status: "pending", payment_method: "",
  notes: "", project_url: "", deadline: "",
};

const PAY_METHODS = [
  { value: "",                   label: "— Select Method —" },
  { value: "UPI",                label: "UPI" },
  { value: "Cash",               label: "Cash" },
  { value: "Account Transfer",   label: "Account Transfer" },
  { value: "Cheque",             label: "Cheque" },
  { value: "Other",              label: "Other" },
];

function StatusBadge({ s }) {
  const map = {
    paid:      "badge badge-paid",
    pending:   "badge badge-pending",
    partial:   "badge badge-partial",
    cancelled: "badge badge-cancelled",
  };
  return (
    <span className={map[s] || map.pending}>
      {s}
    </span>
  );
}

function TransactionsTab() {
  const [txns,    setTxns]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [showForm,setShowForm]= useState(false);
  const [editTxn, setEditTxn] = useState(null);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const loadTxns = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch(
      `/api/admin/transactions?status=${filter}`
    );
    const data = await res.json();
    setTxns(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { loadTxns(); }, [loadTxns]);

  const openNew = () => { setEditTxn(null); setForm(EMPTY_FORM); setSaveErr(""); setShowForm(true); };
  const openEdit = t => {
    setEditTxn(t);
    setSaveErr("");
    setForm({
      client_name:    t.client_name    || "",
      client_email:   t.client_email   || "",
      client_phone:   t.client_phone   || "",
      service_type:   t.service_type   || "",
      package_name:   t.package_name   || "",
      amount:         t.amount         || "",
      payment_status: t.payment_status || "pending",
      payment_method: t.payment_method || "",
      notes:          t.notes          || "",
      project_url:    t.project_url    || "",
      deadline:       t.deadline       || "",
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditTxn(null); setSaveErr(""); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveErr("");
    const method = editTxn ? "PATCH" : "POST";
    const body   = editTxn ? { ...form, id: editTxn.id } : form;
    const res = await adminFetch("/api/admin/transactions", {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setSaveErr(data.error || "Save failed"); return; }
    closeForm(); loadTxns();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction permanently?")) return;
    await adminFetch("/api/admin/transactions", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    loadTxns();
  };

  const totalRevenue = txns.filter(t => t.payment_status === "paid")
                           .reduce((s, t) => s + Number(t.amount), 0);
  const pending      = txns.filter(t => t.payment_status === "pending")
                           .reduce((s, t) => s + Number(t.amount), 0);

  const FILTERS = ["all","pending","partial","paid","cancelled"];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Records"     value={fmt(txns.length)} icon={Receipt} />
        <StatCard label="Revenue Collected" value={`₹${fmt(totalRevenue)}`} />
        <StatCard label="Pending Amount"    value={`₹${fmt(pending)}`} />
        <StatCard label="Paid Projects"     value={fmt(txns.filter(t => t.payment_status === "paid").length)} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Filter by status">
          {FILTERS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
                    aria-pressed={filter === s}
                    className={`btn btn-sm capitalize ${filter === s ? "btn-primary" : "btn-ghost"} ${FOCUS}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={openNew}
                className={`btn btn-primary btn-sm ml-auto inline-flex items-center gap-1.5 ${FOCUS}`}>
          <Plus size={14} aria-hidden="true" /> Add Transaction
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <Modal>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl font-normal text-ink">{editTxn ? "Edit Transaction" : "New Transaction"}</h3>
            <button type="button" onClick={closeForm} aria-label="Close"
                    className={`p-1.5 rounded-full text-mute hover:text-ink hover:bg-sand ${FOCUS}`}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-3">
            {[
              { key: "client_name",  label: "Client Name *",      type: "text"   },
              { key: "client_email", label: "Email",               type: "email"  },
              { key: "client_phone", label: "Phone / WhatsApp",    type: "tel"    },
              { key: "service_type", label: "Service Type",        type: "text"   },
              { key: "package_name", label: "Package",             type: "text"   },
              { key: "amount",       label: "Amount (₹) *",        type: "number" },
              { key: "project_url",  label: "Project URL",         type: "url"    },
              { key: "deadline",     label: "Deadline",            type: "date"   },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label htmlFor={`txn-${key}`} className="field-label">{label}</label>
                <input id={`txn-${key}`} type={type} value={form[key]} required={label.includes("*")}
                       onChange={e => setForm({ ...form, [key]: e.target.value })}
                       className="admin-input" />
              </div>
            ))}
            <div>
              <label htmlFor="txn-payment_method" className="field-label">Payment Method</label>
              <select id="txn-payment_method" value={form.payment_method}
                      onChange={e => setForm({ ...form, payment_method: e.target.value })}
                      className="admin-input">
                {PAY_METHODS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="txn-payment_status" className="field-label">Payment Status</label>
              <select id="txn-payment_status" value={form.payment_status}
                      onChange={e => setForm({ ...form, payment_status: e.target.value })}
                      className="admin-input">
                {["pending","partial","paid","cancelled"].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="txn-notes" className="field-label">Notes</label>
              <textarea id="txn-notes" value={form.notes} rows={3}
                        onChange={e => setForm({ ...form, notes: e.target.value })}
                        className="admin-input resize-none" />
            </div>
            {saveErr && <p className="text-bad text-sm bg-sand px-3 py-2 rounded-lg" role="alert">{saveErr}</p>}
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving}
                      className={`btn btn-primary flex-1 disabled:opacity-60 flex items-center justify-center gap-2 ${FOCUS}`}>
                {saving ? <><span className="spinner" /> Saving…</> : editTxn ? "Update" : "Add"}
              </button>
              <button type="button" onClick={closeForm}
                      className={`btn btn-ghost flex-1 ${FOCUS}`}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Table */}
      {loading ? (
        <LoadingState />
      ) : txns.length === 0 ? (
        <EmptyState icon={Receipt} text="No transactions found for this filter." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="admin-table min-w-[700px] w-full">
            <thead>
              <tr>
                <th>Invoice</th><th>Client</th><th>Package</th>
                <th>Amount</th><th>Method</th><th>Status</th>
                <th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={t.id}>
                  <td className="font-mono text-xs text-mute">
                    {t.invoice_number}
                  </td>
                  <td>
                    <p className="font-medium text-ink text-sm">{t.client_name}</p>
                    <p className="text-xs text-mute">{t.client_email}</p>
                  </td>
                  <td className="text-sm text-ink-2">{t.package_name}</td>
                  <td className="font-semibold text-ink text-sm">₹{fmt(t.amount)}</td>
                  <td className="text-xs text-ink-2">{t.payment_method || "—"}</td>
                  <td><StatusBadge s={t.payment_status} /></td>
                  <td className="text-xs text-mute">
                    {new Date(t.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(t)}
                              aria-label={`Edit transaction for ${t.client_name}`}
                              className={`btn btn-ghost btn-sm inline-flex items-center gap-1 ${FOCUS}`}>
                        <Pencil size={12} aria-hidden="true" /> Edit
                      </button>
                      <button onClick={() => handleDelete(t.id)}
                              aria-label={`Delete transaction for ${t.client_name}`}
                              className={`btn btn-ghost btn-sm inline-flex items-center gap-1 text-bad ${FOCUS}`}>
                        <Trash2 size={12} aria-hidden="true" /> Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Brands Tab ───────────────────────────────────────────────────────────── */
const WORK_KEYS = ["category", "summary", "result", "tags", "image_url", "case_study"];
const EMPTY_BRAND = {
  name: "", logo_url: "", website_url: "", display_order: 0, active: true,
  category: "", summary: "", result: "", tags: "", image_url: "", case_study: "", featured: false,
};

function BrandsTab() {
  const [brands,    setBrands]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [form,      setForm]      = useState(EMPTY_BRAND);
  const [saving,    setSaving]    = useState(false);
  const [saveErr,   setSaveErr]   = useState("");

  const loadBrands = useCallback(async () => {
    setLoading(true); setError("");
    const r = await api("/api/admin/brands");
    if (r.ok) setBrands(Array.isArray(r.data) ? r.data : []);
    else setError(r.error);
    setLoading(false);
  }, []);
  useEffect(() => { loadBrands(); }, [loadBrands]);

  const closeForm = () => { setShowForm(false); setEditBrand(null); setSaveErr(""); };

  const openNew = () => {
    setEditBrand(null); setSaveErr("");
    setForm({ ...EMPTY_BRAND, display_order: brands.length });
    setShowForm(true);
  };

  const openEdit = (brand) => {
    setEditBrand(brand); setSaveErr("");
    setForm({
      name: brand.name || "", logo_url: brand.logo_url || "", website_url: brand.website_url || "",
      display_order: brand.display_order ?? 0, active: brand.active !== false,
      category: brand.category || "", summary: brand.summary || "", result: brand.result || "",
      tags: brand.tags || "", image_url: brand.image_url || "", case_study: brand.case_study || "",
      featured: !!brand.featured,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true); setSaveErr("");
    const body = { ...form, display_order: Number(form.display_order) || 0 };
    // Before the migration is run, old rows have no work-page columns: only send
    // them if the row has them already or the owner actually filled them in.
    for (const k of [...WORK_KEYS, "featured"]) {
      const filled = k === "featured" ? form.featured === true : String(form[k] || "").trim() !== "";
      if (editBrand ? !(k in editBrand) && !filled : !filled) delete body[k];
    }
    const r = await api("/api/admin/brands", {
      method: editBrand ? "PATCH" : "POST",
      body: editBrand ? { ...body, id: editBrand.id } : body,
    });
    setSaving(false);
    if (!r.ok) { setSaveErr(r.error); return; }
    closeForm(); loadBrands();
  };

  const handleToggle = async brand => {
    const r = await api("/api/admin/brands", { method: "PATCH", body: { id: brand.id, active: !brand.active } });
    if (!r.ok) setError(r.error); else loadBrands();
  };

  const handleDelete = async id => {
    if (!confirm("Delete this brand?")) return;
    const r = await api("/api/admin/brands", { method: "DELETE", body: { id } });
    if (!r.ok) setError(r.error); else loadBrands();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-mute">{brands.length} brands</p>
        <button onClick={openNew}
                className={`btn btn-primary btn-sm inline-flex items-center gap-1.5 ${FOCUS}`}>
          <Plus size={14} aria-hidden="true" /> Add Brand
        </button>
      </div>

      {showForm && (
        <Modal onClose={closeForm} label={editBrand ? "Edit brand" : "Add brand"}>
          <ModalHeader title={editBrand ? "Edit Brand" : "Add Brand"} onClose={closeForm} />
          <form onSubmit={handleSave} className="space-y-3">
            {[
              { key: "name",          label: "Brand Name *"             },
              { key: "logo_url",      label: "Logo URL *"               },
              { key: "website_url",   label: "Website URL *"            },
              { key: "display_order", label: "Display Order", type:"number" },
            ].map(({ key, label, type="text" }) => (
              <div key={key}>
                <label htmlFor={`brand-${key}`} className="field-label">{label}</label>
                <input id={`brand-${key}`} type={type} value={form[key]} required={label.includes("*")}
                       onChange={e => setForm({ ...form, [key]: e.target.value })}
                       className="admin-input" />
              </div>
            ))}
            {form.logo_url && (
              <div className="panel p-3">
                <p className="text-xs mb-2 text-mute">Preview</p>
                <img src={form.logo_url} alt="preview" className="h-10 object-contain"
                     onError={e => e.target.style.display = "none"} />
              </div>
            )}
            <div className="flex items-center gap-3">
              <span id="brand-active-label" className="text-sm text-ink-2">Active</span>
              <button type="button" onClick={() => setForm({ ...form, active: !form.active })}
                      role="switch" aria-checked={form.active} aria-labelledby="brand-active-label"
                      className={`w-11 h-6 rounded-full relative transition-colors ${form.active ? "bg-ink" : "bg-line-2"} ${FOCUS}`}>
                <span className="absolute top-1 w-4 h-4 rounded-full bg-paper transition-all"
                      style={{ left: form.active ? "calc(100% - 20px)" : "4px" }} />
              </button>
            </div>

            <fieldset className="panel p-4 space-y-3 mt-2">
              <legend className="eyebrow px-1">Work page details (optional)</legend>
              <p className="text-xs text-mute">A project gets its own case-study page once it has a summary.</p>
              <div>
                <label htmlFor="brand-category" className="field-label">Category</label>
                <input id="brand-category" className="admin-input" maxLength={120} placeholder="e.g. E-commerce"
                       value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label htmlFor="brand-summary" className="field-label">One-line summary</label>
                <input id="brand-summary" className="admin-input" maxLength={500}
                       value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />
              </div>
              <div>
                <label htmlFor="brand-result" className="field-label">Result / outcome</label>
                <input id="brand-result" className="admin-input" maxLength={500}
                       value={form.result} onChange={e => setForm({ ...form, result: e.target.value })} />
              </div>
              <div>
                <label htmlFor="brand-tags" className="field-label">Tags (comma separated)</label>
                <input id="brand-tags" className="admin-input" maxLength={300} placeholder="Next.js, Supabase"
                       value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
              </div>
              <div>
                <label htmlFor="brand-image_url" className="field-label">Screenshot image URL</label>
                <input id="brand-image_url" className="admin-input" maxLength={1000}
                       value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
              </div>
              <div>
                <label htmlFor="brand-case_study" className="field-label">Case study (paragraphs separated by a blank line)</label>
                <textarea id="brand-case_study" rows={6} maxLength={20000} className="admin-input"
                          value={form.case_study} onChange={e => setForm({ ...form, case_study: e.target.value })} />
              </div>
              <div className="flex items-center gap-3">
                <span id="brand-featured-label" className="text-sm text-ink-2">Featured</span>
                <button type="button" onClick={() => setForm({ ...form, featured: !form.featured })}
                        role="switch" aria-checked={form.featured} aria-labelledby="brand-featured-label"
                        className={`w-11 h-6 rounded-full relative transition-colors ${form.featured ? "bg-ink" : "bg-line-2"} ${FOCUS}`}>
                  <span className="absolute top-1 w-4 h-4 rounded-full bg-paper transition-all"
                        style={{ left: form.featured ? "calc(100% - 20px)" : "4px" }} />
                </button>
              </div>
            </fieldset>

            {saveErr && <p className="text-bad text-sm bg-sand px-3 py-2 rounded-lg" role="alert">{saveErr}</p>}
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving}
                      className={`btn btn-primary flex-1 disabled:opacity-60 flex items-center justify-center gap-2 ${FOCUS}`}>
                {saving ? <><span className="spinner" /> Saving…</> : "Save"}
              </button>
              <button type="button" onClick={closeForm} className={`btn btn-ghost flex-1 ${FOCUS}`}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {error && !loading && brands.length > 0 && <p className="text-bad text-sm mb-4" role="alert">{error}</p>}

      {loading ? (
        <LoadingState />
      ) : error && brands.length === 0 ? (
        <ErrorState title="Could not load brands" error={error} onRetry={loadBrands} />
      ) : brands.length === 0 ? (
        <EmptyState icon={Tag} text="No brands yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map(brand => (
            <div key={brand.id} className="card p-5 transition-opacity"
                 style={{ opacity: brand.active ? 1 : 0.6 }}>
              <div className="flex items-start justify-between mb-3 gap-2">
                <img src={brand.logo_url} alt={brand.name} className="h-12 object-contain"
                     onError={e => e.target.style.display = "none"} />
                <button onClick={() => handleToggle(brand)}
                        aria-label={`${brand.active ? "Hide" : "Show"} ${brand.name}`}
                        className={`badge ${brand.active ? "badge-paid" : "badge-cancelled"} ${FOCUS}`}>
                  {brand.active ? "Live" : "Hidden"}
                </button>
              </div>
              <p className="font-semibold text-ink text-sm mb-1 flex flex-wrap items-center gap-2">
                {brand.name}
                {brand.summary && <span className="badge badge-partial">Case study</span>}
              </p>
              <a href={brand.website_url} target="_blank" rel="noopener noreferrer"
                 className={`text-xs truncate block mb-4 text-mute hover:text-ink underline-offset-2 hover:underline rounded ${FOCUS}`}>
                {brand.website_url}
              </a>
              <div className="flex gap-2">
                <button onClick={() => openEdit(brand)}
                        className={`btn btn-ghost btn-sm flex-1 inline-flex items-center justify-center gap-1 ${FOCUS}`}>
                  <Pencil size={12} aria-hidden="true" /> Edit
                </button>
                <button onClick={() => handleDelete(brand.id)}
                        aria-label={`Delete ${brand.name}`}
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

/* ── Messages Tab ─────────────────────────────────────────────────────────── */
const SERVICE_PREFIX = /^\[Service:\s*([^\]]+)\]\s*/;

function splitService(m) {
  if (m.service) return { service: m.service, body: m.message };
  const hit = SERVICE_PREFIX.exec(m.message || "");
  return hit ? { service: hit[1].trim(), body: m.message.replace(SERVICE_PREFIX, "") } : { service: "", body: m.message };
}

function MessageCard({ m, onChanged, onError }) {
  const { service, body } = splitService(m);
  const [notes,  setNotes]  = useState(m.notes || "");
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [busy,   setBusy]   = useState(false);
  const dirty = notes !== (m.notes || "");

  const patch = async (payload) => {
    const r = await api("/api/admin/messages", { method: "PATCH", body: { id: m.id, ...payload } });
    if (!r.ok) onError(r.error);
    return r.ok;
  };

  const markStatus = async (status) => {
    setBusy(true);
    if (await patch({ status })) onChanged();
    setBusy(false);
  };

  const saveNotes = async () => {
    setSaving(true); setSaved(false);
    if (await patch({ notes })) { setSaved(true); onChanged(); }
    setSaving(false);
  };

  const remove = async () => {
    if (!confirm(`Delete the message from ${m.name}? This cannot be undone.`)) return;
    setBusy(true);
    const r = await api("/api/admin/messages", { method: "DELETE", body: { id: m.id } });
    if (!r.ok) { onError(r.error); setBusy(false); return; }
    onChanged();
  };

  return (
    <div className={`card p-5 ${m.status === "unread" ? "border-gold" : ""}`}
         style={m.status === "unread" ? { borderColor: "#b68a2e" } : undefined}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-ink text-sm">{m.name}</p>
          <div className="flex flex-wrap gap-3 text-xs mt-0.5 text-mute">
            {m.email && <a href={`mailto:${m.email}`} className={`hover:text-ink underline-offset-2 hover:underline rounded ${FOCUS}`}>{m.email}</a>}
            {m.phone && <a href={`tel:${m.phone}`} className="hover:text-ink">{m.phone}</a>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge s={m.status === "unread" ? "pending" : m.status === "replied" ? "paid" : "partial"} />
          <span className="text-xs text-mute">
            {new Date(m.created_at).toLocaleDateString("en-IN")}
          </span>
        </div>
      </div>
      {service && (
        <p className="mb-2"><span className="badge badge-partial">Service: {service}</span></p>
      )}
      <p className="text-sm leading-relaxed mb-4 text-ink-2 whitespace-pre-wrap break-words">{body}</p>

      <div className="mb-4">
        <label htmlFor={`note-${m.id}`} className="field-label">Private notes</label>
        <textarea id={`note-${m.id}`} rows={2} maxLength={2000} className="admin-input resize-none"
                  placeholder="Only you can see this" value={notes}
                  onChange={e => { setNotes(e.target.value); setSaved(false); }} />
        {(dirty || saved) && (
          <button onClick={saveNotes} disabled={saving || !dirty}
                  className={`btn btn-ghost btn-sm mt-2 inline-flex items-center gap-1.5 disabled:opacity-60 ${FOCUS}`}>
            {saving ? <><span className="spinner" /> Saving…</> : saved && !dirty ? <><Check size={13} aria-hidden="true" /> Saved</> : "Save notes"}
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <a href={m.email ? `mailto:${m.email}` : `tel:${m.phone}`}
           className={`btn btn-primary btn-sm inline-flex items-center gap-1.5 ${FOCUS}`}>
          <Reply size={13} aria-hidden="true" /> Reply
        </a>
        {m.status !== "read" && (
          <button onClick={() => markStatus("read")} disabled={busy}
                  className={`btn btn-ghost btn-sm ${FOCUS}`}>
            Mark Read
          </button>
        )}
        {m.status !== "replied" && (
          <button onClick={() => markStatus("replied")} disabled={busy}
                  className={`btn btn-ghost btn-sm inline-flex items-center gap-1.5 ${FOCUS}`}>
            <Check size={13} aria-hidden="true" /> Mark Replied
          </button>
        )}
        <button onClick={remove} disabled={busy} aria-label={`Delete message from ${m.name}`}
                className={`btn btn-ghost btn-sm ml-auto inline-flex items-center gap-1.5 text-bad ${FOCUS}`}>
          <Trash2 size={12} aria-hidden="true" /> Delete
        </button>
      </div>
    </div>
  );
}

function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const loadMessages = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    const r = await api("/api/admin/messages");
    if (r.ok) { setMessages(Array.isArray(r.data) ? r.data : []); setError(""); }
    else setError(r.error);
    setLoading(false);
  }, []);
  useEffect(() => { loadMessages(); }, [loadMessages]);

  const unread = messages.filter(m => m.status === "unread").length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <p className="text-sm text-mute">{messages.length} messages</p>
        {unread > 0 && (
          <span className="badge badge-pending">
            {unread} unread
          </span>
        )}
      </div>

      {error && !loading && messages.length > 0 && <p className="text-bad text-sm mb-4" role="alert">{error}</p>}

      {loading ? (
        <LoadingState />
      ) : error && messages.length === 0 ? (
        <ErrorState title="Could not load messages" error={error} onRetry={() => loadMessages()} />
      ) : messages.length === 0 ? (
        <EmptyState icon={Inbox} text="No messages yet" />
      ) : (
        <div className="space-y-3">
          {messages.map(m => (
            <MessageCard key={m.id} m={m} onChanged={() => loadMessages(true)} onError={setError} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Admin Panel ─────────────────────────────────────────────────────── */
export default function AdminPanel() {
  const [authed,   setAuthed]   = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab,      setTab]      = useState("transactions");

  // Mark this browser as the owner's so own visits are never counted.
  useEffect(() => { try { localStorage.setItem("dws_owner", "1"); } catch {} }, []);

  useEffect(() => {
  fetch("/api/admin/session")
    .then(async (res) => {
      const data = await res.json();

      if (data.authenticated) {
        setAuthed(true);
      }
    })
    .catch(() => {})
    .finally(() => setChecking(false));
}, []);

  const handleLogout = async () => {
    await adminFetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  };

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-ink">
      <div className="spinner" />
    </div>
  );

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const TABS = [
    { id: "transactions", label: "Transactions", Icon: Receipt  },
    { id: "brands",       label: "Brands",       Icon: Tag      },
    { id: "packages",     label: "Packages",     Icon: Package  },
    { id: "testimonials", label: "Testimonials", Icon: Quote    },
    { id: "messages",     label: "Messages",     Icon: Mail     },
    { id: "onboarding",   label: "Onboarding",   Icon: Link2    },
    { id: "documents",    label: "Documents",    Icon: FileText },
    { id: "visitors",     label: "Visitors",     Icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper px-4 sm:px-6 py-3">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/dws-mark.png" alt="Dharma Web Services" className="h-8 w-auto object-contain" />
            <span className="font-display text-2xl font-normal text-ink leading-none truncate">Dharma Vault</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer"
               className={`btn btn-ghost btn-sm max-sm:!hidden items-center gap-1.5 ${FOCUS}`}>
              View Site <ExternalLink size={12} aria-hidden="true" />
            </a>
            <button onClick={handleLogout}
                    className={`btn btn-ghost btn-sm inline-flex items-center gap-1.5 ${FOCUS}`}>
              <LogOut size={13} aria-hidden="true" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Tabs */}
        <nav aria-label="Sections" className="flex flex-wrap gap-x-1 mb-7 border-b border-line">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                      aria-current={active ? "page" : undefined}
                      className={`relative inline-flex items-center gap-2 px-3 sm:px-4 py-3 text-sm whitespace-nowrap transition-colors ${active ? "text-ink font-medium" : "text-mute hover:text-ink"} ${FOCUS}`}>
                <Icon size={15} aria-hidden="true" />
                {label}
                {active && (
                  <span className="absolute left-3 right-3 sm:left-4 sm:right-4 -bottom-px h-0.5 rounded-full"
                        style={{ background: "#b68a2e" }} />
                )}
              </button>
            );
          })}
        </nav>

        {tab === "transactions" && <TransactionsTab />}
        {tab === "brands"       && <BrandsTab />}
        {tab === "packages"     && <PackagesTab />}
        {tab === "testimonials" && <TestimonialsTab />}
        {tab === "messages"     && <MessagesTab />}
        {tab === "onboarding"   && <OnboardingTab />}
        {tab === "documents"    && <DocumentsTab />}
        {tab === "visitors"     && <VisitorsTab />}
      </main>
    </div>
  );
}
