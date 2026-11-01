"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/content";
import OpenPopup from "./OpenPopup";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu whenever the route changes.
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock page scroll while the mobile menu is open; Esc closes it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <div className="container-x flex h-[4.25rem] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Dharma Web Services — home">
          <Image src="/dws-mark.png" alt="" width={480} height={327} priority sizes="56px" className="h-9 w-auto" />
          <span className="hidden font-display text-[1.4rem] leading-none tracking-tight text-ink sm:block">
            Dharma Web Services
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`relative px-3.5 py-2 text-[0.9rem] font-medium transition-colors ${
                isActive(href) ? "text-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              {label}
              {isActive(href) && <span className="absolute inset-x-3.5 bottom-0.5 h-px bg-gold" />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <OpenPopup className="btn btn-primary btn-sm">Get in touch</OpenPopup>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center border border-line-2 text-ink lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[95] flex flex-col overflow-y-auto bg-bg"
        >
          <div className="container-x flex h-[4.25rem] shrink-0 items-center justify-between border-b border-line">
            <Image src="/dws-mark.png" alt="Dharma Web Services" width={480} height={327} sizes="56px" className="h-9 w-auto" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center border border-line-2 text-ink"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="container-x flex flex-1 flex-col justify-center py-6" aria-label="Mobile">
            {NAV.map(({ href, label }, i) => (
              <Link
                key={href}
                href={href}
                className="flex items-baseline gap-4 border-b border-line py-4 font-display text-[2.1rem] leading-none text-ink"
              >
                <span className="w-6 font-sans text-xs text-mute">0{i + 1}</span>
                {label}
              </Link>
            ))}
          </nav>

          <div className="container-x shrink-0 pb-8">
            <Link href="/contact" className="btn btn-primary btn-lg w-full">Contact us</Link>
          </div>
        </div>
      )}
    </header>
  );
}
