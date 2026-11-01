// Shared (server + client safe) definition of the onboarding questionnaire.
// Used by the form, the API validation and the Vault "View answers" modal.

export const GOALS = [
  ["leads", "Get leads / enquiries"],
  ["sell", "Sell online"],
  ["portfolio", "Show my portfolio"],
  ["bookings", "Take bookings"],
  ["credibility", "Build brand credibility"],
  ["other", "Other"],
];
export const PAGES = ["Home", "About", "Services", "Portfolio", "Blog", "Contact", "Pricing", "Other"].map((p) => [p, p]);
export const FEATURES = [
  ["contact_form", "Contact form"],
  ["whatsapp", "WhatsApp button"],
  ["payments", "Online payments"],
  ["admin", "Admin panel"],
  ["login", "User login"],
  ["multilang", "Multi-language"],
  ["booking", "Booking system"],
];
export const LOGO_OPTS = [["yes", "Yes, I have one"], ["need", "No, I need one designed"], ["no", "No"]];
export const CONTENT_OPTS = [["yes", "Yes, ready"], ["partly", "Partly ready"], ["no", "Not yet"]];
export const DOMAIN_OPTS = [["have", "I already have a domain"], ["help", "I need help getting one"]];
export const BUDGETS = [
  ["under-5k", "Under ₹5,000"],
  ["5k-10k", "₹5,000 – ₹10,000"],
  ["10k-25k", "₹10,000 – ₹25,000"],
  ["25k-plus", "₹25,000+"],
  ["unsure", "Not sure yet"],
];

const keys = (list) => list.map((x) => x[0]);
export const ALLOWED = {
  goals: keys(GOALS),
  pages: keys(PAGES),
  features: keys(FEATURES),
  logo_status: keys(LOGO_OPTS),
  content_status: keys(CONTENT_OPTS),
  domain_status: keys(DOMAIN_OPTS),
  budget: keys(BUDGETS),
};

// Display order + labels for answers
export const ANSWER_LABELS = [
  ["business_name", "Business name"],
  ["contact_person", "Contact person"],
  ["email", "Email"],
  ["phone", "Phone / WhatsApp"],
  ["existing_website", "Existing website"],
  ["business_description", "About the business"],
  ["target_audience", "Target audience"],
  ["goals", "Goals"],
  ["pages", "Pages needed"],
  ["features", "Features needed"],
  ["other_details", "Other (details)"],
  ["style_notes", "Brand colours / style"],
  ["logo_status", "Logo"],
  ["content_status", "Content ready"],
  ["domain_status", "Domain"],
  ["domain_name", "Domain name"],
  ["references", "Reference websites"],
  ["deadline", "Preferred deadline"],
  ["budget", "Budget"],
  ["notes", "Anything else"],
];

const OPT_LISTS = {
  goals: GOALS, pages: PAGES, features: FEATURES, logo_status: LOGO_OPTS,
  content_status: CONTENT_OPTS, domain_status: DOMAIN_OPTS, budget: BUDGETS,
};

// Turns the stored answers into [label, readable value] rows (skips empty).
export function answersToRows(answers) {
  const a = answers && typeof answers === "object" ? answers : {};
  const rows = [];
  for (const [key, label] of ANSWER_LABELS) {
    let v = a[key];
    const list = OPT_LISTS[key];
    const nice = (x) => (list?.find((o) => o[0] === x)?.[1] ?? x);
    if (Array.isArray(v)) v = v.map(nice).filter(Boolean).join(", ");
    else if (typeof v === "string") v = nice(v);
    if (v === undefined || v === null || String(v).trim() === "") continue;
    rows.push([label, String(v)]);
  }
  return rows;
}
