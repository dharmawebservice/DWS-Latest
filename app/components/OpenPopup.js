"use client";
// Any button that opens the Get in touch popup.
export default function OpenPopup({ children, className = "" }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("dws:open-popup"))}>
      {children}
    </button>
  );
}
