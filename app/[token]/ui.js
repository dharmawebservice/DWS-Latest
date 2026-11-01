"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

export async function adminFetch(url, options = {}) {
  return fetch(url, {
    credentials: "include",
    cache: "no-store",
    ...options,
  });
}

// Calls an admin endpoint and never throws: { ok, data, error, migration }.
export async function api(url, { method = "GET", body } = {}) {
  try {
    const res = await adminFetch(url, {
      method,
      ...(body !== undefined
        ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
        : {}),
    });
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) {
      const error = res.status === 401
        ? "Your session expired. Reload the page and log in again."
        : data?.error || `Request failed (HTTP ${res.status})`;
      return { ok: false, error, migration: !!data?.migration };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Could not reach the server. Check your connection." };
  }
}

export const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export function LoadingState({ text = "Loading…" }) {
  return (
    <div className="text-center py-20 flex flex-col items-center gap-3 text-mute">
      <span className="spinner" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, text }) {
  return (
    <div className="card text-center py-16 px-4 flex flex-col items-center gap-3">
      <span className="icon-tile"><Icon size={18} aria-hidden="true" /></span>
      <p className="text-sm text-mute max-w-md">{text}</p>
    </div>
  );
}

export function ErrorState({ title = "Could not load this section", error, onRetry }) {
  return (
    <div className="card p-6 text-center" role="alert">
      <p className="text-bad font-medium mb-1">{title}</p>
      <p className="text-sm text-mute">{error}</p>
      {onRetry && (
        <button onClick={onRetry} className={`btn btn-ghost btn-sm mt-4 ${FOCUS}`}>Try Again</button>
      )}
    </div>
  );
}

export function Modal({ children, maxWidth = "max-w-lg", onClose, label }) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: "rgba(15,17,21,.35)", backdropFilter: "blur(4px)" }}>
      <div role="dialog" aria-modal="true" aria-label={label}
           className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-[20px] border border-line bg-paper p-6 shadow-lift`}
           onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-display text-2xl font-normal text-ink">{title}</h3>
      <button type="button" onClick={onClose} aria-label="Close"
              className={`p-1.5 rounded-full text-mute hover:text-ink hover:bg-sand ${FOCUS}`}>
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-ink-2">{label}</span>
      <button type="button" onClick={() => onChange(!checked)}
              role="switch" aria-checked={checked} aria-label={label}
              className={`w-11 h-6 rounded-full relative transition-colors ${checked ? "bg-ink" : "bg-line-2"} ${FOCUS}`}>
        <span className="absolute top-1 w-4 h-4 rounded-full bg-paper transition-all"
              style={{ left: checked ? "calc(100% - 20px)" : "4px" }} />
      </button>
    </div>
  );
}

export const fmtINR = (n) => Number(n || 0).toLocaleString("en-IN");
