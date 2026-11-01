"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/content";

const NEEDS = ["Business website", "Online store", "Web app / dashboard", "SEO & maintenance", "Not sure yet"];
const TIMES = ["Any time", "Morning (9–12)", "Afternoon (12–4)", "Evening (4–8)"];
const SEEN = "dws_popup_seen";

// "Get in touch" popup. Opens after 8 s (or on desktop exit-intent), once per visit,
// and any "Get in touch" button can open it via the `dws:open-popup` event.
export default function LeadPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState("idle"); // idle | sending | done
  const [err, setErr] = useState("");
  const [f, setF] = useState({ name: "", phone: "", service: NEEDS[0], when: TIMES[0], website: "" });
  const first = useRef(null);
  const last = useRef(null);

  const mark = () => { try { sessionStorage.setItem(SEEN, "1"); } catch {} };
  const seen = () => { try { return sessionStorage.getItem(SEEN) === "1"; } catch { return false; } };
  const close = useCallback(() => { setOpen(false); mark(); }, []);
  const quiet = pathname === "/contact";

  // Auto-open after 8 s, and on exit intent (desktop only). Once per visit.
  useEffect(() => {
    if (quiet || seen()) return;
    const show = () => { if (!seen()) { setOpen(true); mark(); } };
    const t = setTimeout(show, 8000);
    const leave = (e) => { if (e.clientY <= 0 && window.matchMedia("(hover:hover)").matches) show(); };
    document.addEventListener("mouseout", leave);
    return () => { clearTimeout(t); document.removeEventListener("mouseout", leave); };
  }, [quiet]);

  // Manual open from header / sticky bar buttons.
  useEffect(() => {
    const h = () => { setState("idle"); setOpen(true); };
    window.addEventListener("dws:open-popup", h);
    return () => window.removeEventListener("dws:open-popup", h);
  }, []);

  // Scroll lock, Esc to close, focus handling.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const els = document.querySelectorAll("#lead-popup input, #lead-popup select, #lead-popup button, #lead-popup a");
        if (!els.length) return;
        const a = els[0], z = els[els.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    window.addEventListener("keydown", key);
    setTimeout(() => first.current?.focus(), 50);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", key); };
  }, [open, close]);

  const set = (k) => (e) => { setF((p) => ({ ...p, [k]: e.target.value })); setErr(""); };

  const submit = async (e) => {
    e.preventDefault();
    if (state === "sending") return;
    if (f.name.trim().length < 2) return setErr("Please enter your name.");
    if (!/^[+\d][\d\s()-]{6,18}$/.test(f.phone.trim())) return setErr("Please enter a valid phone number.");
    setState("sending");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, source: "popup" }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Something went wrong.");
      setState("done");
    } catch (x) {
      setErr(x.message || "Something went wrong. Please try WhatsApp.");
      setState("idle");
    }
  };

  if (!open) return null;

  return (
    <div className="popup-overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div id="lead-popup" role="dialog" aria-modal="true" aria-labelledby="lead-h" className="popup">
        <button type="button" onClick={close} className="popup-x" aria-label="Close">×</button>

        <div className="popup-side">
          <div>
            <p className="eyebrow">Get in touch</p>
            <h2 id="lead-h" className="mt-4 font-display text-[2rem] leading-[1.08] !text-[#faf7f0]">
              Let&apos;s build <em>yours.</em>
            </h2>
          </div>
          <p className="text-[0.85rem] text-[#faf7f0]/80">We reply within a few hours. No obligation.</p>
        </div>

        <div className="popup-main">
          {state === "done" ? (
            <div role="status" className="flex h-full flex-col justify-center">
              <p className="font-display text-[1.7rem] leading-tight text-ink">Thank you, {f.name.split(" ")[0]}.</p>
              <p className="mt-3 text-[0.95rem] text-ink-2">We&apos;ve got your details and will call you {f.when === "Any time" ? "soon" : `in the ${f.when.split(" ")[0].toLowerCase()}`}.</p>
              <button type="button" onClick={close} className="btn btn-primary mt-6">Close</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label className="sr-only" htmlFor="pp-name">Your name</label>
              <input id="pp-name" ref={first} className="field mb-3" placeholder="Your name" autoComplete="name" value={f.name} onChange={set("name")} />
              <label className="sr-only" htmlFor="pp-phone">Phone or WhatsApp</label>
              <input id="pp-phone" className="field mb-3" placeholder="Phone / WhatsApp" type="tel" autoComplete="tel" inputMode="tel" value={f.phone} onChange={set("phone")} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="sr-only" htmlFor="pp-need">What do you need?</label>
                  <select id="pp-need" className="field" value={f.service} onChange={set("service")}>{NEEDS.map((n) => <option key={n}>{n}</option>)}</select>
                </div>
                <div>
                  <label className="sr-only" htmlFor="pp-when">Best time to call</label>
                  <select id="pp-when" className="field" value={f.when} onChange={set("when")}>{TIMES.map((n) => <option key={n}>{n}</option>)}</select>
                </div>
              </div>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set("website")} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
              {err && <p className="field-error" role="alert">{err}</p>}
              <button type="submit" disabled={state === "sending"} className="btn btn-gold mt-4 w-full">
                {state === "sending" ? <span className="spinner" /> : "Send enquiry →"}
              </button>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <a href={SITE.whatsappHello} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">WhatsApp</a>
                <a ref={last} href={`tel:${SITE.phoneTel}`} className="btn btn-ghost btn-sm">Call now</a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
