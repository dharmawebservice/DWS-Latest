"use client";
import { useEffect, useState } from "react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY = { name: "", email: "", phone: "", service: "", message: "", website: "" };

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = "Please enter your name.";
  if (!EMAIL.test(v.email.trim())) e.email = "Please enter a valid email address.";
  if (v.phone.trim() && !/^[+\d][\d\s()-]{6,18}$/.test(v.phone.trim())) e.phone = "Please enter a valid phone number.";
  if (v.message.trim().length < 10) e.message = "Please tell us a little more (at least 10 characters).";
  return e;
}

export default function ContactForm({ serviceOptions = [] }) {
  const [v, setV] = useState({ ...EMPTY, service: serviceOptions[0] || "" });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle"); // idle | sending | done | error
  const [serverMsg, setServerMsg] = useState("");

  // Pre-select a package when arriving from the pricing cards (?plan=Pro).
  useEffect(() => {
    const plan = new URLSearchParams(window.location.search).get("plan");
    if (!plan) return;
    const hit = serviceOptions.find((o) => o.toLowerCase().includes(plan.toLowerCase()));
    if (hit) setV((p) => ({ ...p, service: hit }));
  }, [serviceOptions]);

  const set = (k) => (e) => {
    setV((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (state === "sending") return;
    const found = validate(v);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`c-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setState("sending");
    setServerMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setState("done");
      setV({ ...EMPTY, service: serviceOptions[0] || "" });
    } catch (err) {
      setServerMsg(err.message || "Something went wrong. Please try again.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="card p-8 text-center sm:p-12" role="status">
        <span className="icon-tile mx-auto !h-14 !w-14 !rounded-full">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
        </span>
        <h2 className="display-md mt-6">Thank you — message received.</h2>
        <p className="mx-auto mt-3 max-w-sm text-ink-2">We&apos;ll get back to you shortly by email or WhatsApp.</p>
        <button type="button" onClick={() => setState("idle")} className="btn btn-ghost mt-8">Send another message</button>
      </div>
    );
  }

  const field = (id, label, props = {}, Tag = "input") => (
    <div>
      <label htmlFor={`c-${id}`} className="field-label">{label}</label>
      <Tag
        id={`c-${id}`}
        name={id}
        value={v[id]}
        onChange={set(id)}
        aria-invalid={errors[id] ? "true" : undefined}
        aria-describedby={errors[id] ? `c-${id}-err` : undefined}
        className="field"
        {...props}
      >
        {props.children}
      </Tag>
      {errors[id] && <p id={`c-${id}-err`} className="field-error" role="alert">{errors[id]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="card space-y-5 p-6 sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", "Your name *", { type: "text", autoComplete: "name", maxLength: 120 })}
        {field("email", "Email *", { type: "email", autoComplete: "email", inputMode: "email", maxLength: 200 })}
      </div>
      {field("phone", "Phone / WhatsApp", { type: "tel", autoComplete: "tel", inputMode: "tel", maxLength: 40, placeholder: "+91 …" })}
      {field("service", "I'm interested in", { children: serviceOptions.map((o) => <option key={o} value={o}>{o}</option>) }, "select")}
      {field("message", "Tell us about your project *", { rows: 5, maxLength: 4000, placeholder: "What do you need, and by when?" }, "textarea")}

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="c-website">Leave this empty</label>
        <input id="c-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} />
      </div>

      {state === "error" && <p className="border border-[#f2c9c5] bg-[#fbe8e6] px-4 py-3 text-sm text-bad" role="alert">{serverMsg}</p>}

      <button type="submit" disabled={state === "sending"} className="btn btn-primary btn-lg w-full">
        {state === "sending" ? <><span className="spinner" /> Sending…</> : "Send message"}
      </button>
      <p className="text-center text-xs text-mute">We use your details only to reply to your enquiry. See our <a href="/privacy" className="underline">privacy policy</a>.</p>
    </form>
  );
}
