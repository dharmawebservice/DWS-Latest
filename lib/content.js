// Single source of truth for site copy and fallbacks.
// Live data (brands, packages, testimonials) comes from Supabase via lib/data.js;
// the fallbacks below keep the site complete if the database is unreachable.

export const SITE = {
  name: "Dharma Web Services",
  short: "DWS",
  url: "https://www.dharmawebservice.in",
  email: "dharmawebservice@gmail.com",
  phoneDisplay: "+91 96112 41651",
  phoneTel: "+919611241651",
  whatsapp: "https://wa.me/919611241651",
  whatsappHello:
    "https://wa.me/919611241651?text=Hi%20DWS!%20I'm%20interested%20in%20building%20a%20website.",
  x: "https://x.com/DharmaServices",
  instagram: "https://instagram.com/dharma_web_services",
  city: "Hyderabad, India",
};

export const NAV = [
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/pricing", label: "Pricing" },
  { href: "/process", label: "Process" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

/* Public first-segments that should be counted by the visitor tracker. */
export const PUBLIC_ROOTS = [
  "", "services", "work", "pricing", "process", "blog", "about", "contact", "privacy", "terms", "cookies",
];

export const STATS = [
  { value: "30+", label: "Projects delivered" },
  { value: "7–14", label: "Days, typical delivery" },
  { value: "4", label: "Countries served" },
  { value: "1 month", label: "Free support after launch" },
];

export const SERVICES = [
  {
    slug: "business-websites",
    icon: "Globe",
    title: "Business Websites",
    short: "Fast, polished, multi-page sites that make a strong first impression and bring in enquiries.",
    tagline: "A fast, polished site that makes a strong first impression.",
    intro:
      "Your website is usually the first thing a customer sees. We design and build multi-page business sites that load quickly, read clearly on a phone, and make it easy for visitors to get in touch.",
    forWho:
      "Clinics, restaurants, consultants, contractors, schools, studios and agencies — any business that needs to be found and trusted online.",
    includes: [
      "Custom design — no recycled templates",
      "Mobile-first layouts that look right on every screen",
      "Contact form that lands in your inbox, with a WhatsApp button",
      "On-page SEO: titles, descriptions, sitemap and schema markup",
      "Speed tuning for Google's Core Web Vitals",
      "Free hosting setup on Vercel or Netlify",
    ],
    stack: ["Next.js", "React", "Tailwind CSS", "Vercel"],
    faqs: [
      { q: "How many pages can I have?", a: "As many as your business needs. Our Starter package covers 1–3 pages, Pro up to 6, and Business is unlimited. Extra pages can always be added later." },
      { q: "Will I be able to edit the content myself?", a: "Yes. We can connect a simple content editor or admin panel so you can change text, images and offers without touching code." },
      { q: "Do you write the content?", a: "We structure and polish the copy you provide, and can help with headlines and calls to action. Full copywriting can be arranged on request." },
    ],
  },
  {
    slug: "web-apps",
    icon: "Layers",
    title: "Web Apps & Dashboards",
    short: "Booking systems, client portals, dashboards and internal tools with a real backend and login.",
    tagline: "Custom software for the way your business actually works.",
    intro:
      "When a brochure site is not enough, we build the tool itself: a booking system, a client portal, an admin dashboard or a small SaaS product — with authentication, a database and a clean interface your team will enjoy using.",
    forWho:
      "Businesses replacing spreadsheets and WhatsApp threads with a proper system, and founders validating a software idea.",
    includes: [
      "User accounts, login and role-based access",
      "Database design on Supabase or PostgreSQL",
      "Admin dashboard to manage your data",
      "Email notifications and third-party API integrations",
      "Secure deployment with environment-based configuration",
      "Full source code handed over to you",
    ],
    stack: ["Next.js", "Supabase", "PostgreSQL", "Django"],
    faqs: [
      { q: "How long does a web app take?", a: "Small apps usually take 2–3 weeks. Larger systems are scoped after a discovery call so you get a realistic timeline and price up front." },
      { q: "Will I own the code?", a: "Yes. Once the final payment is made, the code, database and deployment belong to you." },
      { q: "Can you add features later?", a: "Absolutely. We build in a modular way so new features can be added without rewriting what already works." },
    ],
  },
  {
    slug: "online-stores",
    icon: "ShoppingBag",
    title: "Online Stores",
    short: "E-commerce with product management, cart, secure payments and an admin panel. Ready to sell on day one.",
    tagline: "Everything you need to sell online, without the monthly platform fees.",
    intro:
      "We build online stores that are quick to browse, simple to manage and ready to take payments. You get a catalogue, cart and checkout, plus an admin panel to handle products and orders yourself.",
    forWho:
      "Brands and local businesses moving from Instagram and WhatsApp orders to a store of their own.",
    includes: [
      "Product and category management",
      "Cart and a smooth, mobile-friendly checkout",
      "Razorpay and Stripe payment integration",
      "Admin panel for products and orders",
      "Fast product pages with SEO built in",
      "Order notification emails",
    ],
    stack: ["Next.js", "Razorpay", "Stripe", "Supabase"],
    faqs: [
      { q: "Which payment gateways do you support?", a: "Razorpay for India and Stripe for international payments are the most common. Others can be integrated on request." },
      { q: "Can I manage products myself?", a: "Yes. The admin panel lets you add products, change prices and stock, and see orders without developer help." },
      { q: "Are there recurring platform fees?", a: "No monthly platform fee from us. You pay only for the build, plus normal gateway charges and your domain and hosting if needed." },
    ],
  },
  {
    slug: "seo-and-maintenance",
    icon: "Search",
    title: "SEO & Maintenance",
    short: "Technical SEO, speed tuning and ongoing care so your site keeps ranking, loading fast and working.",
    tagline: "Keep your site fast, findable and in good health.",
    intro:
      "A website is not finished at launch. We audit and improve existing sites for speed and search visibility, and look after them afterwards with updates, fixes and monitoring.",
    forWho:
      "Owners whose current site is slow, hard to find on Google, or has been left without anyone looking after it.",
    includes: [
      "Technical SEO audit and fixes",
      "Meta titles, descriptions and schema markup",
      "Sitemap and Google Search Console setup",
      "Speed and Core Web Vitals tuning",
      "Content and design updates on request",
      "Bug fixes, security updates and backups",
    ],
    stack: ["Lighthouse", "Search Console", "Schema.org", "Vercel"],
    faqs: [
      { q: "Can you work on a site you did not build?", a: "Yes. We start with an audit, tell you what is holding the site back, and quote for the fixes." },
      { q: "How is maintenance priced?", a: "It depends on the size of the site and how much support you want, so we quote after a short conversation. Get in touch for details." },
      { q: "Do I get a report?", a: "Yes. Audits come with a plain-language summary of what we found and what we changed." },
    ],
  },
];

export const REASONS = [
  { icon: "Zap", title: "Delivered in 7–14 days", desc: "No months of waiting. We work fast without cutting corners." },
  { icon: "Gem", title: "Premium at fair prices", desc: "Agency-quality design with freelancer pricing. Packages start at ₹2,499." },
  { icon: "Rocket", title: "Free hosting setup", desc: "We set up Vercel or Netlify for you — no extra cost." },
  { icon: "MessageCircle", title: "Direct WhatsApp support", desc: "Talk to the person building your site. No ticketing, no delays." },
  { icon: "RefreshCw", title: "Revisions until you're happy", desc: "We iterate until you love it. Unlimited revisions on Pro and Business." },
  { icon: "ShieldCheck", title: "1 month of free support", desc: "Bug fixes and small tweaks after launch — we stand by our work." },
];

export const STEPS = [
  { num: "01", title: "Discovery call", desc: "A short WhatsApp or Zoom call to understand your business, goals, audience and budget.", you: "Tell us what you need and who it is for.", we: "Ask the right questions and suggest the simplest route to your goal." },
  { num: "02", title: "Onboarding & proposal", desc: "You fill in a short private onboarding form. We reply with a clear scope, timeline and fixed price.", you: "Complete the private onboarding form and approve the proposal.", we: "Turn your answers into a written scope, price and delivery date." },
  { num: "03", title: "Design & prototype", desc: "You see a live preview before we write the full build, so there are no surprises.", you: "Review the design and tell us what to change.", we: "Design the layout, typography and key pages in your brand." },
  { num: "04", title: "Development", desc: "We build the full site with clean, fast code, responsive layouts and the features you chose.", you: "Share any remaining content and images.", we: "Build, connect the backend and optimise for speed and SEO." },
  { num: "05", title: "Review & refine", desc: "You test everything. We revise until it is right — we test every button, link and form too.", you: "Test on your phone and computer and send feedback.", we: "Fix, polish and run a final quality audit." },
  { num: "06", title: "Launch & handoff", desc: "We deploy, connect your domain and hand everything over. Free support continues after launch.", you: "Approve and make the final payment.", we: "Go live, hand over code and access, and stay on call for a month." },
];

export const FAQS = [
  { q: "How long does it take to build my website?", a: "Most projects are delivered in 7–14 days. Simple landing pages take 5–7 days. Complex online stores or web apps can take up to 3 weeks." },
  { q: "Do I need to pay anything upfront?", a: "Yes. We take a 50% advance before starting and the remaining 50% on completion. For smaller projects, full payment upfront is required." },
  { q: "Will I own the website and code?", a: "100%. Once the final payment is made, all code, assets and the deployed site belong to you. We give you access to the GitHub repository and hosting." },
  { q: "What if I'm not happy with the design?", a: "We offer unlimited revisions on Pro and Business packages until you are satisfied. The Starter package includes 3 revision rounds." },
  { q: "Do you provide hosting?", a: "We set up free hosting on Vercel or Netlify, which handles thousands of visitors at no cost. For heavy traffic or backend-heavy apps we will recommend the right option." },
  { q: "Can I update the website myself after launch?", a: "Yes. We can add a simple content editor or admin panel so you can update text, images and offers without touching code." },
  { q: "Do you work with international clients?", a: "Yes. We have worked with clients in India, the UK, UAE and US. We communicate on WhatsApp and Zoom, and accept international payments." },
  { q: "What technology do you use?", a: "Mainly Next.js, React and Tailwind CSS for the front end, and Supabase or Django for the back end, hosted on Vercel. We choose the best tools for each project." },
];

/* Fallback if the `packages` table is empty or unreachable. */
export const PLANS_FALLBACK = [
  {
    id: "starter", name: "Starter", price: 2499, original: 2999, badge: "₹500 off",
    desc: "Perfect for small businesses and landing pages.",
    features: ["1–3 pages", "Mobile responsive", "Contact form", "Basic SEO setup", "Free Vercel hosting", "1-week delivery"],
    cta: "Get started", popular: false, service: "Landing Page (Starter — ₹2,499)",
  },
  {
    id: "pro", name: "Pro", price: 5999, original: null, badge: "Most popular",
    desc: "For businesses that need a powerful online presence.",
    features: ["Up to 6 pages", "Premium animations", "WhatsApp integration", "Advanced SEO", "Priority support", "Unlimited revisions", "Google Analytics"],
    cta: "Get Pro", popular: true, service: "Business Website (Pro — ₹5,999)",
  },
  {
    id: "business", name: "Business", price: 9999, original: null, badge: null,
    desc: "Full-stack solution with backend and admin panel.",
    features: ["Unlimited pages", "Custom admin panel", "Database & backend", "Payment integration", "Performance optimization", "1-month free support", "Full source code"],
    cta: "Go Business", popular: false, service: "Full-Stack App (Business — ₹9,999)",
  },
];

/* Fallback work list (the real projects from the original site). */
export const WORK_FALLBACK = [
  { id: "w1", name: "CraveCart", logo: "/brands/cravecart.webp", url: "https://crave-cart-82wd.onrender.com" },
  { id: "w2", name: "Subio Foods", logo: "/brands/Subio.webp", url: "https://subiofoods.com" },
  { id: "w3", name: "Diyami Productions", logo: "/brands/diyami.webp", url: "https://diyamiproductions.com" },
  { id: "w4", name: "AC5 Construction", logo: "/brands/ac5.webp", url: "https://www.ac5construction.co.uk" },
];

/* Project details written for the original site. Used only when the database
   row has no summary/image of its own, so you can override all of it in the Vault. */
export const WORK_DEFAULTS = {
  cravecart: {
    category: "E-Commerce",
    summary: "Full-stack food delivery platform with real-time cart, Razorpay payments and an admin dashboard.",
    image: "/portfolio/1.webp",
    tags: ["Next.js", "Node.js", "MongoDB"],
  },
  "subio-foods": {
    category: "Food & Beverage",
    summary: "Brand website for an artisan food startup with product showcase, story and online order flow.",
    image: "/portfolio/subio.webp",
    tags: ["React", "Framer Motion", "Vercel"],
  },
  "diyami-productions": {
    category: "Creative Agency",
    summary: "Visually rich portfolio site for a production house with video embeds and smooth animations.",
    image: "/portfolio/diyami.webp",
    tags: ["React", "GSAP", "Vercel"],
  },
  "ac5-construction": {
    category: "Corporate",
    summary: "Professional website for a UK-based construction company with service listings and a contact pipeline.",
    image: "/portfolio/ac5.webp",
    tags: ["Next.js", "Tailwind", "Netlify"],
  },
};

export const STACK = ["Next.js", "React", "Tailwind CSS", "Supabase", "Django", "PostgreSQL", "Vercel", "Razorpay"];

// Which project appears next to the home page headline: cravecart, diyami-productions, ac5-construction or subio-foods.
export const HERO_SLUG = "cravecart";
