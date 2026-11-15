"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Scroll-linked motion for the pricing and work cards.
// Nothing plays on its own: each card's state is driven by where it sits in the window, so it
// moves only while the visitor scrolls, and runs backwards when they scroll back up.
// Every [data-sr] element gets a CSS variable --p (0 to 1); all visuals live in globals.css.
// The variable is eased toward its target for a soft, premium feel. Until this runs (and when the
// visitor prefers reduced motion) cards are fully visible, so the page never depends on it.
const clamp = (v) => Math.min(1, Math.max(0, v));
const smooth = (v) => v * v * (3 - 2 * v);

// Cards build up as they rise through the window. Once past, they stay fully built.
const RULES = {
  hw: { from: 1.0, to: 0.5 }, // home: work cards (pinboard)
  hp: { from: 1.0, to: 0.30 }, // home: pricing (fan-out)
  pp: { from: 1.0, to: 0.5, back: true }, // pricing page (stamp press)
  ps: { from: 1.0, to: 0.62 }, // pricing page strip
  pw: { from: 1.0, to: 0.5 }, // work page (shelf pull)
};
const backOut = (t) => { const s = 1.9, u = t - 1; return 1 + (s + 1) * u * u * u + s * u * u; };

export default function ScrollMotion() {
  const path = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const els = Array.from(document.querySelectorAll("[data-sr]"));
    if (reduce.matches || !els.length) {
      root.classList.remove("sr");
      return;
    }
    const items = els
      .map((el) => ({
        el, rule: RULES[el.getAttribute("data-sr")], cur: 0, tgt: 0,
        counts: el.getAttribute("data-sr") === "pp"
          ? Array.from(el.querySelectorAll("[data-count]")).map((c) => ({ node: c.firstChild, val: Number(c.getAttribute("data-count")) || 0, final: c.firstChild ? c.firstChild.nodeValue : "" }))
          : null,
      }))
      .filter((i) => i.rule);

    let raf = 0;
    const target = (it, vh) => {
      const r = it.el.getBoundingClientRect();
      return smooth(clamp((vh * it.rule.from - r.top) / (vh * (it.rule.from - it.rule.to))));
    };
    const measure = () => {
      const vh = window.innerHeight;
      for (const it of items) it.tgt = target(it, vh);
    };
    const fmt = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
    const paint = (it) => {
      it.el.style.setProperty("--p", it.cur.toFixed(3));
      if (it.rule.back) it.el.style.setProperty("--b", backOut(it.cur).toFixed(3));
      if (it.cur >= 0.999) it.el.setAttribute("data-done", "1"); else it.el.removeAttribute("data-done");
      if (it.counts) {
        const q = smooth(clamp(it.cur / 0.7)); // finishes counting at 70% so the price is final before the card settles
        for (const c of it.counts) if (c.node) c.node.nodeValue = q >= 0.999 ? c.final : fmt(c.val * q);
      }
    };
    const tick = () => {
      raf = 0;
      let busy = false;
      for (const it of items) {
        const d = it.tgt - it.cur;
        if (Math.abs(d) < 0.002) it.cur = it.tgt;
        else { it.cur += d * 0.17; busy = true; }
        paint(it);
      }
      if (busy) raf = requestAnimationFrame(tick);
    };
    const kick = () => { measure(); if (!raf) raf = requestAnimationFrame(tick); };

    measure();
    for (const it of items) { it.cur = it.tgt; paint(it); } // first frame is already in place
    root.classList.add("sr");

    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    const onPref = () => { if (reduce.matches) { root.classList.remove("sr"); items.forEach((i) => { i.el.style.removeProperty("--p"); i.el.removeAttribute("data-done"); i.counts?.forEach((c) => { if (c.node) c.node.nodeValue = c.final; }); }); } };
    reduce.addEventListener?.("change", onPref);
    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      reduce.removeEventListener?.("change", onPref);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [path]);

  return null;
}
