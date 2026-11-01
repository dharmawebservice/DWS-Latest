"use client";
import dynamic from "next/dynamic";

// Loaded after the page is interactive, so they never compete with the first paint.
const LeadPopup = dynamic(() => import("./LeadPopup"), { ssr: false });
const VisitorTracker = dynamic(() => import("./VisitorTracker"), { ssr: false });

export default function LazyWidgets() {
  return (
    <>
      <LeadPopup />
      <VisitorTracker />
    </>
  );
}