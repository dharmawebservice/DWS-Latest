"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | invalid

  const subscribe = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus("invalid"); return; }
    setStatus("loading");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch { /* the API is intentionally forgiving */ }
    setStatus("done");
    setEmail("");
  };

  if (status === "done") {
    return <p className="mt-4 text-sm font-medium text-gold-light" role="status">You&apos;re subscribed. Thank you!</p>;
  }

  return (
    <form onSubmit={subscribe} className="mt-4" noValidate>
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <div className="flex items-center border border-line-2 bg-paper p-1 pl-4 focus-within:border-ink focus-within:ring-4 focus-within:ring-gold/15">
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === "invalid") setStatus("idle"); }}
          placeholder="you@example.com"
          autoComplete="email"
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-[#7b7e86]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-9 shrink-0 items-center justify-center bg-gold px-4 text-sm font-semibold text-ink transition-colors hover:bg-gold-light disabled:opacity-60"
        >
          {status === "loading" ? <span className="spinner" /> : "Join"}
        </button>
      </div>
      {status === "invalid" && <p className="field-error" role="alert">Please enter a valid email address.</p>}
    </form>
  );
}
