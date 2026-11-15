# DWS website: end-to-end audit (31 Oct 2026)

## Fixed during the audit
| Area | Problem | Fix |
|---|---|---|
| Security (critical) | Next.js 15.5.19 had known remote-code-execution and cache-poisoning flaws (image optimizer, ISR) | Upgraded to 15.5.28 |
| Security (high) | Admin login fell back to a built-in secret if JWT_SECRET was not set, so anyone could forge a Vault session | Removed in production. Login now refuses to work until JWT_SECRET (16+ characters) is set |
| Security | /api/visits and /api/newsletter had no rate limit or size limits (database spam risk) | Rate-limited and clipped |
| Security | Missing HSTS and cross-origin headers | Added |
| Robustness | A top-level Supabase client crashed module loading if env vars were missing | Made lazy |
| Privacy | Invalid onboarding links returned 200 | Now a real 404 |
| SEO | Three titles over 70 chars, two thin descriptions | Shortened / lengthened |
| Mobile | Footer links too small to tap; contact form buried under info blocks | Larger targets; form first on phones |
| Cleanup | Debug console.log left in an API route | Removed |

## Verified (all passing)
- 37 end-to-end checks (contact form, popup, honeypot, rate limit, admin login, Packages / Testimonials / Brands / Onboarding, single-use client links, Vault display) with a mock database.
- 18 pages x 5 screen sizes (320, 375, 768, 1024, 1440 px): no horizontal scroll, no console errors, no failed requests; 23 internal links all work.
- 23 sitemap URLs: unique titles and descriptions, canonical, Open Graph, exactly one h1, valid JSON-LD, images have alt text.
- Lighthouse: desktop 100/100/100/100; mobile accessibility, best practices, SEO 100 everywhere.

## Known / accepted
- 2 npm audit findings remain (PostCSS bundled inside Next). It only runs at build time on our own CSS, so visitors are not exposed. Clearing it needs Next 16, a larger and riskier upgrade.
- Rate limiting is in memory per server instance. It blunts bots but is not a hard guarantee on serverless.
- Mobile performance scores 85-97 in a simulated slow phone; real devices are faster. The score is noisy.
- Not testable here: real email delivery (needs RESEND_API_KEY and a verified domain to reach both addresses) and your real Supabase data.
- Privacy, Terms and Cookie pages are templates: review the refund and governing-law wording before relying on them.


## Addendum: Documents tab

- New Vault tab generating 7 client documents plus an internal pre-project checklist. API `/api/admin/docs` is behind the same JWT middleware; input keys, sizes and counts are limited. Preview runs in a sandboxed iframe; all user text is HTML-escaped.
- Tested against a mock database: create, save, reload, select, Word download, PDF layout (11 A4 pages for 7 documents), missing-table message. No console errors.

## Audit 15 Nov 2026: responsiveness + scroll motion
- Responsive sweep: 13 pages x 11 widths (320, 360, 375, 390, 414, 768, 820, 1024, 1280, 1440, 1920): no horizontal scroll, no JS errors. Only tiny targets left are inline text links inside sentences (exempt from WCAG target-size). Footer email/phone got taller tap areas.
- New two-way scroll motion (app/components/ScrollMotion.js + CSS in globals.css). Scroll down: cards enter. Scroll back up past them: they leave and replay. 
  - Pricing: rise + gold rule draws across the top + features cascade; Pro card staggers last.
  - Work: cards slide in from alternating sides, image revealed by a curtain wipe and settles from a slight zoom, text fades up.
  - Uses only transform/opacity/clip-path (no layout shift). Hover lift unchanged. Hidden only after JS runs, so no-JS and prefers-reduced-motion users see everything normally. Phones use a simple upward rise.
- Fixed: gold rule crossed the "Most popular" badge; badge now sits above it.
- Not changed: eslint has no config file in the project (npm run lint is not set up).

## 15 Nov 2026 (2): scroll-linked motion + lighter footer
- Replaced the first animations. Cards now move only while scrolling (position-driven, reverses on scroll up). Four different styles: home work = tilt-up, work page = focus pull, home pricing = fan-out deck, pricing page = unroll + gold glint + feature tick-in.
- Reduced-motion and no-JS visitors see static cards. Footer slimmed (3 columns, legal links in the bottom bar), larger light logo.

## 15 Nov 2026 (3): final scroll motion
- Home pricing fan-out untouched. Home work = "Iris" (photo opens like a camera aperture with a gold ring, text pulls into focus). Work page = "Book spread" (cards swing open on a spine). Pricing page = "Build-up" (cards rise, price counts up, gold ticks draw, top bar charges).
- Cards stay fully visible once scrolled past. Checked at 390, 768, 1280 px: no sideways scroll, no console errors.
