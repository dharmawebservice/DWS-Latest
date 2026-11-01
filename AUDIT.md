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
