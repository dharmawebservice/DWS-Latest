"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PUBLIC_ROOTS } from "@/lib/content";

// Only genuine public pages are counted. The private admin URL and the
// client onboarding links are never sent to analytics.
const isPublic = (path) => PUBLIC_ROOTS.includes(path.split("/")[1] || "");

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isPublic(pathname)) return;
    // Real people only: skip automated browsers and the owner, and count a visit
    // only after the page has been visible for a few seconds.
    try { if (navigator.webdriver || localStorage.getItem("dws_owner") === "1") return; } catch {}
    const send = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pathname }),
        keepalive: true,
      }).catch(() => {});
    };
    const t = setTimeout(send, 3000);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
