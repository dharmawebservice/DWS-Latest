// Blog content for Dharma Web Services (DWS).
// Author byline for every post: "Dharmendra, Dharma Web Services".

export const POSTS = [
  {
    slug: 'how-much-does-a-website-cost-in-india',
    title: 'How much does a business website cost in India?',
    description:
      'What decides the price of a business website in India: pages, design, features and hidden costs, plus what to ask an agency and the red flags to avoid.',
    category: 'Business',
    date: '2026-10-12',
    updated: '2026-10-24',
    readMinutes: 5,
    body: [
      {
        type: 'p',
        text: 'Ask five agencies what a website costs and you will get five very different numbers. That is not always a sign that someone is overcharging. Websites are not a fixed product like a phone. The price depends on what you are actually asking for, and most business owners only discover the missing pieces after they have paid the first instalment. This guide explains what moves the price, so you can compare quotes properly.',
      },
      { type: 'h2', text: 'What drives the cost' },
      {
        type: 'ul',
        items: [
          'Number of pages. A one-page site and a twenty-page site are not the same job. Every page needs layout work, content placement, testing on phones and, ideally, its own search-friendly title and description.',
          'Custom design or a template. A design made from scratch around your brand takes a designer real hours. A modified template is faster and cheaper, but it will look like other sites using the same template.',
          'Features. A contact form is simple. Online payments, a customer login, a booking system, an admin panel where you edit products or content yourself, or a dashboard all add real development and testing time. Each one is a mini project of its own.',
          'Content. Someone has to write the text, shoot or source the photos and prepare them. If you supply everything ready, the price drops. If the agency writes and photographs, it rises.',
          'Maintenance. Software needs updates, backups and fixes. A site that is never touched again slowly becomes slower and less secure.',
        ],
      },
      { type: 'h2', text: 'Typical price bands, and why quotes differ' },
      {
        type: 'p',
        text: 'In broad terms, in India you will see four bands. A landing page, which is one page built to sell a single offer, sits at the low end. A business website with several pages such as Home, About, Services and Contact sits above that. An online store with a product catalogue, cart and payments costs noticeably more again. A custom web application, where users log in and do things, is the most expensive because it is built around your specific process and not assembled from standard parts.',
      },
      {
        type: 'p',
        text: 'Within each band the range is wide. A freelancer working alone, a small studio and a large agency with project managers and account teams all price differently, and they deliver different levels of support. Two quotes for the same online store can also be far apart because one includes payment gateway setup, product upload and a month of support, and the other does not. Always compare what is included, not just the total.',
      },
      {
        type: 'callout',
        text: 'DWS packages start at ₹2,499 and are listed on the pricing page, so you can see what each package includes before you speak to anyone.',
      },
      { type: 'h2', text: 'Costs people forget' },
      {
        type: 'ul',
        items: [
          'Domain name. Usually a yearly renewal, and it should be registered in your name, not the agency\'s.',
          'Hosting. Some sites need paid hosting every month or year. Static sites on a good platform can cost very little, but dynamic sites with databases cost more.',
          'Business email. Addresses like name@yourbusiness.com normally come from a separate paid service, not from the website itself.',
          'Payment gateway fees. Gateways such as Razorpay charge a percentage on each transaction, and there can be GST on top of that fee. This is a running cost of selling online, not a one-time cost.',
          'Ongoing updates. New photos, changed prices, seasonal offers and plugin or library updates all need someone\'s time.',
        ],
      },
      { type: 'h2', text: 'What to ask before you pay' },
      {
        type: 'ol',
        items: [
          'What exactly is included: how many pages, how many rounds of changes, and whether content writing and image work are part of the price?',
          'Who owns the domain, the hosting account and the source code after the project ends?',
          'What are the yearly costs after launch, listed one by one?',
          'Will the site be mobile friendly and tested on real phones, and how fast will it load?',
          'What is the timeline, and what do you need to provide to keep it on schedule?',
          'What happens after launch: is there a support period, and what does it cost to make small changes later?',
          'Can I see two or three live sites you have built, and can I speak to a past client?',
        ],
      },
      { type: 'h2', text: 'Red flags' },
      {
        type: 'ul',
        items: [
          'A price that is dramatically lower than every other quote, with no explanation of what is left out.',
          'Pressure to pay the full amount upfront. A staged payment tied to milestones is normal.',
          'No written scope. If the pages and features are not on paper, disputes are almost guaranteed.',
          'The agency registers the domain or hosting in its own name and will not transfer it.',
          'Promises of guaranteed first-page Google rankings. Nobody can guarantee that.',
          'A template that is resold to many clients with only the logo changed, sold as a custom design.',
        ],
      },
      { type: 'h2', text: 'How to set a sensible budget' },
      {
        type: 'p',
        text: 'Start from what the site must do in the first six months, not from everything you might want eventually. If you need customers to find your phone number and see your work, a small business site is enough. If you need to take orders online, you need a store.  A well-built small site can be extended later, which is almost always cheaper than paying up front for features that sit unused.',
      },
    ],
  },
  {
    slug: 'website-speed-and-core-web-vitals',
    title: 'Website speed and Core Web Vitals, explained',
    description:
      'Why a fast website wins more customers, what LCP, INP and CLS actually measure, and the practical fixes that make small-business sites load quickly.',
    category: 'Performance',
    date: '2026-10-16',
    updated: '2026-10-24',
    readMinutes: 5,
    body: [
      {
        type: 'p',
        text: 'A slow website costs you visitors you already paid to attract. Someone taps your link from Instagram or a Google result, stares at a blank screen on a mobile connection, and leaves before seeing a single product. Speed is also part of how Google judges the experience of a page. You do not need to be technical to understand the basics, and most fixes are simple once you know where to look.',
      },
      { type: 'h2', text: 'What Core Web Vitals are' },
      {
        type: 'p',
        text: 'Core Web Vitals are three measurements Google publishes to describe how a page feels to a real person. Each has a published threshold for what counts as good.',
      },
      {
        type: 'ul',
        items: [
          'Largest Contentful Paint (LCP): how long it takes for the biggest visible element, usually a hero image or main heading, to appear. Good is 2.5 seconds or less.',
          'Interaction to Next Paint (INP): how quickly the page responds after you tap, click or type. It replaced the older First Input Delay metric. Good is 200 milliseconds or less.',
          'Cumulative Layout Shift (CLS): how much the page jumps around while loading, for example when an image loads late and pushes the button you were about to tap. Good is 0.1 or less.',
        ],
      },
      {
        type: 'p',
        text: 'Google assesses these at the 75th percentile of real visits, which means that three out of four visits should meet the threshold, not just the best one. Good scores will not guarantee a high ranking, because content and relevance matter far more, but a poor experience can hold you back and certainly hurts conversions.',
      },
      { type: 'h2', text: 'The usual causes on small-business sites' },
      {
        type: 'ul',
        items: [
          'Huge images. A phone photo straight from the camera can be several megabytes. Shown in a small box, it still downloads in full.',
          'Too many scripts and plugins. Every chat widget, tracking tag, slider and page-builder add-on adds JavaScript the browser must download and run.',
          'Unoptimised fonts. Loading many font weights from an external service delays text and can make it flash or shift.',
          'Slow hosting. Cheap shared servers in a distant country add delay before anything else even begins.',
        ],
      },
      { type: 'h2', text: 'Concrete fixes' },
      {
        type: 'ol',
        items: [
          'Use modern image formats. WebP and AVIF are usually much smaller than JPEG or PNG at similar visual quality.',
          'Size images correctly. Do not ship a 4000-pixel-wide image to fill a 400-pixel space. Serve sizes that match the layout, and always set width and height so the browser reserves space and avoids layout shift.',
          'Lazy-load below the fold. Images further down the page should load only when the visitor scrolls near them. Do not lazy-load the main hero image, since that is usually your LCP element.',
          'Self-host fonts. Serve a limited number of font files from your own domain, use only the weights you need, and let text show immediately with a fallback while the font loads.',
          'Use static generation and a CDN. If a page does not change per visitor, build it once and serve it from servers close to the user. This is why frameworks like Next.js can deliver pages very quickly.',
          'Remove unused JavaScript. Delete plugins you do not use, load third-party scripts late, and avoid heavy libraries for simple effects.',
          'Choose hosting suited to the site. A static or edge-hosted site will usually beat an overloaded shared server.',
        ],
      },
      { type: 'h2', text: 'How to measure' },
      {
        type: 'p',
        text: 'Lighthouse is built into Chrome. Open DevTools, find the Lighthouse tab and run a report in mobile mode. PageSpeed Insights, at pagespeed.web.dev, runs Lighthouse for you on any public URL and also shows real-world data when enough people have visited the site. Search Console also has a Core Web Vitals report for your whole site once it has enough traffic.',
      },
      { type: 'h2', text: 'Lab data versus field data' },
      {
        type: 'p',
        text: 'Lab data comes from a single simulated test on a fixed device and network. It is repeatable, which makes it ideal for finding and fixing problems while you build. Field data comes from real visitors using their own phones, networks and locations, collected through Chrome. It is what Google uses to assess Core Web Vitals, but it needs enough traffic to exist and it updates slowly, over roughly a month of visits.',
      },
      {
        type: 'p',
        text: 'The two will often disagree. Your lab score can look perfect while field data shows a slow LCP, because many real visitors are on older phones and weaker mobile connections. A brand-new site may show lab data only, until traffic builds up. Use lab data to fix, and field data to confirm that real people are benefiting.',
      },
      {
        type: 'callout',
        text: 'Start with the biggest wins: compress and resize images, remove scripts you do not need, and test on a real mid-range phone over mobile data, not just on your office Wi-Fi.',
      },
      { type: 'h2', text: 'Keep it fast after launch' },
      {
        type: 'p',
        text: 'Speed tends to decay. New plugins, bigger photos and added tracking tags creep in over the months. Re-run PageSpeed Insights after any major change, and compress each new image before you upload it. A fast site is not a one-time achievement, it is a habit.',
      },
    ],
  },
  {
    slug: 'landing-page-or-full-website',
    title: 'Landing page or full website: which do you need?',
    description:
      'A plain guide to choosing between a single landing page, a multi-page website, an online store or a web app, with a checklist and a way to start small.',
    category: 'Guides',
    date: '2026-10-20',
    updated: '2026-10-24',
    readMinutes: 4,
    body: [
      {
        type: 'p',
        text: 'Many business owners ask for a full website when a single page would sell better, and others try to fit five services onto one page that cannot hold them. The right choice depends on what you sell, how people find you and what you want them to do next. Here is how to decide without overspending.',
      },
      { type: 'h2', text: 'When one landing page is enough' },
      {
        type: 'p',
        text: 'A landing page is a single page built around one action: call, book, sign up or buy. It works well when the message is narrow and the visitor arrives with intent.',
      },
      {
        type: 'ul',
        items: [
          'You have one main offer, such as a single service, a course or a product.',
          'You are running ads on Google or Instagram and need a focused page where visitors land.',
          'You are promoting an event, an opening, a seasonal sale or a webinar.',
          'You are testing an idea and want to see if there is demand before investing more.',
          'You need to be online quickly and cheaply, with a clear call or WhatsApp button.',
        ],
      },
      {
        type: 'p',
        text: 'Its strength is focus. With no menu to wander through, visitors see the offer, the proof and the button. Its weakness is limited reach in search, because one page can only rank well for a small set of topics.',
      },
      { type: 'h2', text: 'When you need a multi-page website' },
      {
        type: 'ul',
        items: [
          'You offer several services or product categories, each of which deserves its own explanation.',
          'You depend on search traffic. Separate pages for separate services and locations give Google more to match with what people search for.',
          'Trust matters. Customers want an About page, real photos, reviews, a portfolio and clear contact details before they commit.',
          'You will publish content regularly, such as articles, case studies or updates.',
          'You serve more than one type of customer who needs different information.',
        ],
      },
      {
        type: 'p',
        text: 'Typical pages include Home, About, Services (one page per service is better than one long list), Portfolio or Work, Contact, and legal pages such as privacy policy. This is the most common choice for a clinic, a consultancy, a school, a manufacturer or a local services business.',
      },
      { type: 'h2', text: 'When an online store or web app is warranted' },
      {
        type: 'p',
        text: 'Build an online store when customers should be able to pick products and pay on your site, and you are ready to handle stock, packing, shipping and returns. If you sell only a handful of items, a simple page with a payment link can be enough to begin with. Build a web app when users need to log in and do something that is specific to them: manage bookings, see order history, use a dashboard, or fill in workflows that you currently run through spreadsheets and phone calls. Both options cost more and need ongoing care, so make sure the volume of orders or users justifies the effort.',
      },
      { type: 'h2', text: 'A simple decision checklist' },
      {
        type: 'ol',
        items: [
          'Can I describe what I sell in one sentence? If yes, a landing page may be enough.',
          'Do I have more than two or three distinct services? If yes, plan a multi-page site.',
          'Will most visitors come from paid ads or links I share myself? A landing page suits that. Will they come from search? Choose a multi-page site.',
          'Do customers need to pay online? If yes, consider a store or at least a payment link.',
          'Do customers need to log in or manage something? If yes, you need a web app.',
          'Do I have the content ready: photos, text, testimonials? Content gaps often decide how big the first version should be.',
          'What is my budget, and what can wait until later?',
        ],
      },
      { type: 'h2', text: 'Start small and grow' },
      {
        type: 'p',
        text: 'You do not have to choose once and forever. A site can start as a landing page and be extended later: add an About page when customers ask who you are, split services into their own pages when you have the content, then add a blog, a booking form or a store when the demand is real. A site built on solid foundations makes this straightforward, since new pages reuse the same design and code. Starting small also means you learn from real visitors before spending on features they may never use.',
      },
      {
        type: 'callout',
        text: 'If you are unsure, start with the smallest version that can bring in an enquiry, watch what visitors actually do for a month or two, and let that guide what you add next.',
      },
      {
        type: 'p',
        text: 'Whichever route you pick, make sure the basics are right: it loads fast on a phone, the contact method works, and the message is clear within a few seconds. A simple page that does those three things will beat a larger site that does not.',
      },
    ],
  },
  {
    slug: 'website-launch-checklist',
    title: 'Website launch checklist: 14 checks',
    description:
      'A practical pre-launch checklist for a business website: legal pages, HTTPS, meta tags, sitemap, forms, speed and analytics, plus what to do in week one.',
    category: 'Guides',
    date: '2026-10-24',
    updated: '2026-10-24',
    readMinutes: 4,
    body: [
      {
        type: 'p',
        text: 'Most launch-day problems are small and avoidable: a contact form that sends nowhere, a missing page, a link preview with no image. Go through this list on your live address, not only on a test copy. Each item says why it matters and how to check it.',
      },
      { type: 'h2', text: 'Trust and legal' },
      {
        type: 'ol',
        items: [
          'Privacy policy and terms pages. Why: if you collect enquiries, emails or payments, visitors and payment providers expect to see how you handle their data. Verify: both pages exist, are linked from the footer, and name your business and contact details.',
          'Force HTTPS. Why: browsers warn visitors about sites without it, and it protects form data. Verify: open the http:// version of your address and confirm it redirects to https:// with a padlock and no mixed-content warnings.',
        ],
      },
      { type: 'h2', text: 'Search and sharing' },
      {
        type: 'ol',
        items: [
          'Unique meta titles and descriptions. Why: they are what people read in Google results, and duplicates look careless. Verify: each page has its own title and description; view source or use a browser extension to check.',
          'Social preview (Open Graph) image. Why: links shared on WhatsApp, LinkedIn or Facebook otherwise look bare. Verify: paste your address into a sharing debugger or simply send it to yourself on WhatsApp.',
          'Favicon. Why: it is the small icon in the browser tab and bookmarks, and its absence looks unfinished. Verify: check the tab in Chrome and on your phone.',
          'sitemap.xml and robots.txt. Why: the sitemap lists your pages for search engines, and robots.txt tells crawlers what they may visit. Verify: open yoursite.com/sitemap.xml and yoursite.com/robots.txt, and confirm robots.txt is not blocking the whole site, a leftover from development.',
        ],
      },
      { type: 'h2', text: 'Quality and speed' },
      {
        type: 'ol',
        items: [
          'Compress images. Why: oversized images are the most common cause of slow pages. Verify: no image is far larger than the space it fills, and the page loads quickly on mobile data.',
          'Mobile friendliness. Why: most visitors will arrive on a phone. Verify: open every page on a real phone, check text size, tap targets and that nothing scrolls sideways.',
          'Custom 404 page. Why: a visitor who mistypes an address should be guided back, not left at a dead end. Verify: visit a made-up address and check that you get your branded page with a link home.',
          'Fix broken links. Why: dead links frustrate visitors and look neglected. Verify: click through all menus, footer links and buttons, or run a link-checker tool.',
        ],
      },
      { type: 'h2', text: 'Forms and function' },
      {
        type: 'ol',
        items: [
          'Form validation and an end-to-end test. Why: a form that looks fine but never reaches you silently loses customers. Verify: fill it in with real details, submit it, confirm the success message appears, and confirm the enquiry actually arrives in your inbox or dashboard. Also try empty and invalid entries to check the error messages.',
          'Test every button and link. Why: call buttons, WhatsApp links, maps and social icons are easy to leave pointing to placeholders. Verify: tap each one on a phone and confirm it goes to the right place.',
          'Lighthouse check. Why: it flags speed, accessibility and basic SEO issues quickly. Verify: run it in Chrome DevTools in mobile mode on your key pages and read what it highlights.',
          'Analytics. Why: without it you cannot tell what is working. Verify: open the live site, then check your analytics report to see your own visit appear.',
          'Final audit. Why: small typos and placeholder text survive longer than anyone expects. Verify: read every page aloud, check phone numbers, addresses and prices, and ask someone who has not seen the site to try to find your contact details.',
        ],
      },
      { type: 'h2', text: 'The first week after launch' },
      {
        type: 'ul',
        items: [
          'Submit your sitemap in Google Search Console so Google finds your pages sooner. You will need to verify ownership of your domain first.',
          'Monitor your forms daily. Send yourself a test enquiry on day one and again at the end of the week.',
          'Check your backups. Confirm that your host or platform takes regular backups and know how to restore one.',
          'Watch analytics and Search Console for errors, such as pages that could not be indexed or links that return a 404.',
          'Share the site: add it to your Google Business Profile, social bios, email signature and printed material.',
          'Note every request from real visitors and customers. Those notes become your first round of improvements.',
        ],
      },
      {
        type: 'callout',
        text: 'Do not expect Google to rank a new site in days. Indexing can take from days to weeks, so use the early period to fix issues and build your listings and links.',
      },
    ],
  },
];

export function getPost(slug) {
  return POSTS.find((p) => p.slug === slug);
}

export function getAllPosts() {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
