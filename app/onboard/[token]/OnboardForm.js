"use client";
import { useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import {
  GOALS, PAGES, FEATURES, LOGO_OPTS, CONTENT_OPTS, DOMAIN_OPTS, BUDGETS,
} from "../fields";

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

const INITIAL = {
  business_name: "", contact_person: "", email: "", phone: "", existing_website: "",
  business_description: "", target_audience: "",
  goals: [], pages: [], features: [], other_details: "",
  style_notes: "", logo_status: "", content_status: "", domain_status: "", domain_name: "",
  ref1: "", ref2: "", ref3: "", deadline: "", budget: "", notes: "",
  company_site: "", // honeypot
};

function Section({ title, hint, children }) {
  return (
    <section className="card p-5 sm:p-7">
      <h2 className="font-display text-2xl font-normal text-ink">{title}</h2>
      {hint && <p className="text-xs text-mute mt-1">{hint}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ id, label, required, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}{required && <span className="text-bad" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && <p id={`${id}-err`} className="field-error" role="alert">{error}</p>}
    </div>
  );
}

function Checks({ legend, name, options, values, onToggle }) {
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map(([value, label]) => {
          const on = values.includes(value);
          return (
            <label key={value}
                   className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm cursor-pointer transition-colors ${on ? "border-ink bg-sand text-ink" : "border-line-2 bg-paper text-ink-2 hover:border-ink"}`}>
              <input type="checkbox" name={name} value={value} checked={on}
                     onChange={() => onToggle(value)}
                     className="h-4 w-4 accent-[#0f1115]" />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Radios({ legend, name, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, label]) => {
          const on = value === v;
          return (
            <label key={v}
                   className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm cursor-pointer transition-colors ${on ? "border-ink bg-sand text-ink" : "border-line-2 bg-paper text-ink-2 hover:border-ink"}`}>
              <input type="radio" name={name} value={v} checked={on}
                     onChange={() => onChange(v)} className="h-4 w-4 accent-[#0f1115]" />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function OnboardForm({ token, clientName, packageName }) {
  const [f, setF] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const toggle = (k) => (v) =>
    setF((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  const validate = () => {
    const e = {};
    if (!f.business_name.trim()) e.business_name = "Please enter your business name";
    if (!f.contact_person.trim()) e.contact_person = "Please enter a contact person";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Please enter a valid email";
    if (f.phone.replace(/\D/g, "").length < 7) e.phone = "Please enter a valid phone / WhatsApp number";
    if (!f.business_description.trim()) e.business_description = "Please tell us a little about the business";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setFormError("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`ob-${first}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const { ref1, ref2, ref3, ...rest } = f;
      const res = await fetch(`/api/onboard/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, references: [ref1, ref2, ref3].filter((r) => r.trim()) }),
      });
      let data = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-bg">
        <div className="card w-full max-w-md p-8 sm:p-10 text-center">
          <span className="icon-tile mx-auto mb-5"><CheckCircle2 size={20} aria-hidden="true" /></span>
          <h1 className="font-display text-3xl font-normal text-ink">Thank you!</h1>
          <p className="text-sm mt-3 text-mute leading-relaxed">
            We have received your project details and will get back to you shortly.
          </p>
        </div>
      </main>
    );
  }

  const aria = (k) => ({ id: `ob-${k}`, "aria-invalid": errors[k] ? "true" : undefined, "aria-describedby": errors[k] ? `ob-${k}-err` : undefined });

  return (
    <main className="min-h-screen bg-bg text-ink px-4 py-10 sm:py-14">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center">
          <img src="/dws-mark.png" alt="Dharma Web Services" className="h-10 w-auto object-contain mx-auto mb-5" />
          <h1 className="font-display text-4xl sm:text-5xl font-normal text-ink">Project onboarding</h1>
          <p className="text-sm mt-3 text-mute">
            Hi {clientName}! {packageName ? `Package: ${packageName}. ` : ""}A few quick questions help us build exactly what you need. It takes about 5 minutes.
          </p>
        </header>

        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="panel p-4 flex gap-3 items-start text-sm text-ink-2">
            <ShieldAlert size={18} className="shrink-0 mt-0.5 text-gold-ink" aria-hidden="true" />
            <p>Please don&apos;t share passwords here — we&apos;ll collect access details securely in conversation.</p>
          </div>

          {/* Honeypot: hidden from people and assistive tech */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
            <label>Company site
              <input type="text" name="company_site" tabIndex={-1} autoComplete="off"
                     value={f.company_site} onChange={set("company_site")} />
            </label>
          </div>

          <Section title="About you">
            <Field id="ob-business_name" label="Business name" required error={errors.business_name}>
              <input {...aria("business_name")} className="field" value={f.business_name} onChange={set("business_name")} maxLength={150} autoComplete="organization" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="ob-contact_person" label="Contact person" required error={errors.contact_person}>
                <input {...aria("contact_person")} className="field" value={f.contact_person} onChange={set("contact_person")} maxLength={120} autoComplete="name" />
              </Field>
              <Field id="ob-phone" label="Phone / WhatsApp" required error={errors.phone}>
                <input {...aria("phone")} type="tel" className="field" value={f.phone} onChange={set("phone")} maxLength={40} autoComplete="tel" />
              </Field>
            </div>
            <Field id="ob-email" label="Email" required error={errors.email}>
              <input {...aria("email")} type="email" className="field" value={f.email} onChange={set("email")} maxLength={200} autoComplete="email" />
            </Field>
            <Field id="ob-existing_website" label="Existing website (if any)">
              <input id="ob-existing_website" type="text" inputMode="url" className="field" placeholder="https://" value={f.existing_website} onChange={set("existing_website")} maxLength={300} />
            </Field>
          </Section>

          <Section title="Your business">
            <Field id="ob-business_description" label="What does your business do?" required error={errors.business_description}>
              <textarea {...aria("business_description")} rows={4} className="field" value={f.business_description} onChange={set("business_description")} maxLength={2000} />
            </Field>
            <Field id="ob-target_audience" label="Who are your customers?">
              <textarea id="ob-target_audience" rows={3} className="field" value={f.target_audience} onChange={set("target_audience")} maxLength={1000} />
            </Field>
            <Checks legend="What do you want the website to do?" name="goals" options={GOALS} values={f.goals} onToggle={toggle("goals")} />
          </Section>

          <Section title="What we will build">
            <Checks legend="Pages needed" name="pages" options={PAGES} values={f.pages} onToggle={toggle("pages")} />
            <Checks legend="Features needed" name="features" options={FEATURES} values={f.features} onToggle={toggle("features")} />
            {(f.goals.includes("other") || f.pages.includes("Other")) && (
              <Field id="ob-other_details" label="Tell us about the “Other” items">
                <input id="ob-other_details" className="field" value={f.other_details} onChange={set("other_details")} maxLength={1000} />
              </Field>
            )}
          </Section>

          <Section title="Look & content">
            <Field id="ob-style_notes" label="Brand colours / style notes">
              <textarea id="ob-style_notes" rows={3} className="field" placeholder="e.g. deep green and gold, clean and modern" value={f.style_notes} onChange={set("style_notes")} maxLength={1000} />
            </Field>
            <Radios legend="Do you have a logo?" name="logo_status" options={LOGO_OPTS} value={f.logo_status} onChange={(v) => setF((s) => ({ ...s, logo_status: v }))} />
            <Radios legend="Is your content (text and photos) ready?" name="content_status" options={CONTENT_OPTS} value={f.content_status} onChange={(v) => setF((s) => ({ ...s, content_status: v }))} />
            <Radios legend="Domain name" name="domain_status" options={DOMAIN_OPTS} value={f.domain_status} onChange={(v) => setF((s) => ({ ...s, domain_status: v }))} />
            <Field id="ob-domain_name" label="Domain name (if you have or want one)">
              <input id="ob-domain_name" className="field" placeholder="yourbusiness.com" value={f.domain_name} onChange={set("domain_name")} maxLength={150} />
            </Field>
            <fieldset>
              <legend className="field-label">Websites you like (up to 3)</legend>
              <div className="space-y-2">
                {["ref1", "ref2", "ref3"].map((k, i) => (
                  <input key={k} aria-label={`Reference website ${i + 1}`} className="field" placeholder="https://"
                         inputMode="url" value={f[k]} onChange={set(k)} maxLength={300} />
                ))}
              </div>
            </fieldset>
          </Section>

          <Section title="Timeline & budget">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="ob-deadline" label="Preferred deadline">
                <input id="ob-deadline" type="date" className="field" value={f.deadline} onChange={set("deadline")} />
              </Field>
              <Field id="ob-budget" label="Budget range">
                <select id="ob-budget" className="field" value={f.budget} onChange={set("budget")}>
                  <option value="">Select…</option>
                  {BUDGETS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
            </div>
            <Field id="ob-notes" label="Anything else we should know?">
              <textarea id="ob-notes" rows={4} className="field" value={f.notes} onChange={set("notes")} maxLength={2000} />
            </Field>
          </Section>

          {formError && (
            <p className="text-bad text-sm bg-sand px-4 py-3 rounded-xl" role="alert">{formError}</p>
          )}
          <button type="submit" disabled={busy}
                  className={`btn btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2 ${FOCUS}`}>
            {busy ? <><span className="spinner" /> Sending…</> : "Submit project details"}
          </button>
        </form>
      </div>
    </main>
  );
}
