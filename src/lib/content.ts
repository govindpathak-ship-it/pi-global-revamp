import { asset } from "./asset";

// All copy & numbers below are taken from the live pi.global site (Oct 2026).
// Do not add claims, stats or customer names that are not on the live site.

export const CONTACT_EMAIL = "sales@paytmpayments.com"; // live site's mailto fallback for Contact Sales
export const CONTACT_SUBJECT = "Pi Agents — Contact Sales inquiry";

export const nav = [
  { label: "AI Agents", href: "#agents" },
  { label: "Industries", href: "#industries" },
  { label: "Who is it for?", href: "#who-is-it-for" },
  { label: "Why Paytm", href: "#why-paytm" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "Pi Inference", href: "https://pi.global/pi-inference", external: true },
];

export const hero = {
  eyebrow: "Pi Agents · AI Agents by Paytm",
  titleA: "Business Growth,",
  titleB: "without hiring an Agency",
  sub: "You name the goal. Pi Agents run the campaigns, talk to your customers, and follow up to get you there.",
};

export const outcomes = [
  { icon: "recover-lost-leads.svg", title: "Recover lost leads", body: "Re-engage abandoned leads through AI-powered conversations." },
  { icon: "never-miss-a-query.svg", title: "Never miss a query", body: "Answers questions, resolves complaints, and books appointments instantly." },
  { icon: "complete-the-outcome.svg", title: "Complete the outcome", body: "Executes collections, KYC, onboarding, and compliance checks automatically." },
  { icon: "dollar-sign-left.svg", title: "Sell more to existing customers", body: "Engage customers for cross-selling and upselling." },
  { icon: "get-new-customers.svg", title: "Get new customers", body: "Via Paytm, Meta, Google." },
  { icon: "grow-repeat-revenue.svg", title: "Grow repeat revenue", body: "Automate retention journeys to increase customer lifetime value." },
];

export type Industry = {
  id: string;
  label: string;
  tagline: string;
  image: string;
  pillars: { title: string; body: string }[];
};

export const industries: Industry[] = [
  {
    id: "bfsi",
    label: "BFSI",
    tagline: "Acquire. Collect. Convert. Communicate.",
    image: asset("/images/industries/bfsi.webp"),
    pillars: [
      { title: "Acquire", body: "Lead generation, qualification, and onboarding (KYC/KYB), all the way to activation" },
      { title: "Convert", body: "Turn payments customers into pre-approved credit, borrowers into insurance, investors into larger SIPs" },
      { title: "Collect", body: "Multi-channel EMI reminders, promise-to-pay capture, UPI Autopay setup, failed-payment retry, support and chargeback handling" },
      { title: "Communicate", body: "Reactive query handling and proactive nudges, with receipts and settlement on WhatsApp" },
    ],
  },
  {
    id: "retail",
    label: "Retail",
    tagline: "Turn every walk-in into a relationship.",
    image: asset("/images/industries/retail.webp"),
    pillars: [
      { title: "Acquire", body: "Lookalike-led ads across Paytm, Google, and Meta, with AI-generated creative in every language" },
      { title: "Retain", body: "Loyalty (stamp cards, gift vouchers, cashback), occasion and calendar triggers, win-back of churned customers" },
      { title: "Relate", body: "WhatsApp invoices, two-way conversations, reviews and ratings" },
      { title: "Grow", body: "Cross-sell, upsell, replenishment, subscription, and referral-led expansion" },
    ],
  },
  {
    id: "hospitality",
    label: "Hospitality",
    tagline: "A first-time customer is an event. A returning customer is a business.",
    image: asset("/images/industries/hospitality.webp"),
    pillars: [
      { title: "Order & pay", body: "At the table via QR, from home via storefront, or over the phone via an AI voice agent" },
      { title: "Advertise", body: "Ad campaigns across platforms, with creative generation and spend optimisation" },
      { title: "Market", body: "Customer cohorts, cohort-based campaigns, orchestration and performance insights" },
      { title: "Loyalty & redemption", body: "Points, gift vouchers, and cashback, redeemed through order & pay" },
    ],
  },
  {
    id: "ecommerce",
    label: "E-Commerce",
    tagline: "Turn every interaction into revenue",
    image: asset("/images/industries/ecommerce.webp"),
    pillars: [
      { title: "Acquire", body: "Performance ad campaigns turned to product catalogues, with AI-generated creative variants bespoke for every platform" },
      { title: "Convert", body: "Cart abandonment recovery, checkout nudges on WhatsApp, and real-time upsell at the point of purchase" },
      { title: "Fulfil", body: "Address verification for COD orders, delivery status updates, and proactive interventions to bring down RTOs" },
      { title: "Retain", body: "Reorder and replenishment reminders, post-delivery reviews, and win-back campaigns for lapsed buyers" },
    ],
  },
];

export const logos = [
  { src: asset("/images/logos/logo-1.png"), alt: "OYO" },
  { src: asset("/images/logos/logo-2.png"), alt: "SpiceJet" },
  { src: asset("/images/logos/tata-sons_2.png"), alt: "Tata Sons" },
  { src: asset("/images/logos/logo-4.png"), alt: "Domino's" },
  { src: asset("/images/logos/logo-5.png"), alt: "CEAT" },
  { src: asset("/images/logos/logo-6.png"), alt: "PVR INOX" },
  { src: asset("/images/logos/logo-7.png"), alt: "Biryani Blues" },
  { src: asset("/images/logos/logo-8.png"), alt: "Khimji Jewellers" },
];

export type Agent = {
  id: string;
  name: string;
  short: string;
  tagline: string;
  body: string;
  accent: string;
  flow: [string, string, string];
  does: string[];
  channels: string[];
};

export const agents: Agent[] = [
  {
    id: "sales",
    name: "Pi Sales & Marketing Agent",
    short: "Sales & Marketing",
    tagline: "More customers per dollar, More dollars per customer.",
    body: "From first contact to completed application, working customer by customer, on whichever channel the customer best responds to.",
    accent: "#00BAF2",
    flow: ["Leads Acquired", "Customers Converted", "Revenue Retained"],
    does: [
      "Acquires leads",
      "Qualifies leads",
      "Converts leads into paying customers",
      "Drives cross-sell, upsell, and repeat purchases",
      "Wins back dormant customers",
      "Runs campaigns and generates content",
    ],
    channels: ["WhatsApp", "SMS", "RCS", "Chat AI", "Paytm Ads", "Email", "Voice AI", "Web", "App", "Google Ads", "Meta Ads"],
  },
  {
    id: "service",
    name: "Pi Service Agent",
    short: "Service",
    tagline: "Every Query, Resolved.",
    body: "Resolves the issue a customer raised. Always available, fully contextual, and able to hand off to a human when required.",
    accent: "#27AE60",
    flow: ["Query Received", "Issue Resolved", "Customer Retained"],
    does: [
      "Answers customer questions",
      "Resolves complaints",
      "Offers account and order assistance",
      "Processes refunds and claims",
      "Books appointments",
      "Escalates to a human, when required",
    ],
    channels: ["WhatsApp", "SMS", "Chat AI", "Email", "Voice AI", "Web", "App"],
  },
  {
    id: "operations",
    name: "Pi Operations Agent",
    short: "Operations",
    tagline: "Outcomes, Actioned.",
    body: "Undertakes the outcome action inside enterprise systems, with the audit trail written as it happens.",
    accent: "#85EEFC",
    flow: ["Action Triggered", "System Updated", "Compliance Assured"],
    does: [
      "Undertakes collections and recovery",
      "Conducts KYC and verification",
      "Onboards merchants",
      "Processes loans",
      "Ensures adherence to compliance rules",
      "Updates and reconciles records",
    ],
    channels: ["WhatsApp", "SMS", "RCS", "Chat AI", "Core enterprise systems (API)", "Voice AI", "Email"],
  },
];

export const segments = [
  {
    kicker: "Acquisition & Engagement for",
    title: "Enterprise Businesses",
    body: "Pi Agents turn your existing CRM campaigns into intelligent conversations that drive scalable, automated, and measurable outcomes.",
  },
  {
    kicker: "AI Performance Conversion for",
    title: "Digital First D2C Brands",
    body: "Pi Agents recover leads, personalise outreach, and improve funnel conversion across paid and direct channels — measured against actual revenue, not vanity clicks.",
  },
  {
    kicker: "AI Growth Team for",
    title: "SMEs & Local Businesses",
    body: "Pi Agents handle local ads, follow-ups, and customer acquisition so you can focus on running your business without an agency.",
  },
];

export const paytmCase = {
  stats: [
    { value: "15M+", label: "active merchants" },
    { value: "~22%", label: "higher retention" },
    { value: "100%", label: "answer rates" },
    { value: "~50%", label: "lower cost per call" },
  ],
  body: "Paytm runs Pi Agents across its own operations, like merchant support, Soundbox retention, and lending collections, at a scale few businesses ever reach. AI handles the volume and hands over to humans only when escalation is needed.",
};

export const khimjiCase = {
  stats: [
    { value: "2M+", label: "impressions delivered" },
    { value: "1,500+", label: "hot leads generated" },
  ],
  body: "In a short festive window, Khimji Jewellers needed to find and engage high-value jewellery buyers, fast. Pi Agents ran a Click-to-WhatsApp campaign on Meta, targeting HNI cohorts in Odisha with high purchase intent and converting them into store visits through real-time conversations.",
};

export const footerLinks = [
  { label: "Home", href: "#top" },
  { label: "About Us", href: "https://paytm.com/about-us" },
  { label: "Blog", href: "https://business.paytm.com/blog" },
  { label: "Careers", href: "https://paytm.com/careers/" },
  { label: "Privacy Policy", href: "https://paytm.com/company/privacy-policy" },
  { label: "Terms & Conditions", href: "https://pi.global/#terms-and-conditions" },
];

export const socials = [
  { label: "Facebook", href: "https://www.facebook.com/Paytm" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/paytm" },
  { label: "YouTube", href: "https://www.youtube.com/@paytm" },
  { label: "X", href: "https://x.com/Paytm" },
];

export const roles = ["CXO / Founder", "VP / Director", "Senior Manager", "Manager"];
export const formIndustries = ["Retail", "BFSI", "Hospitality", "Healthcare", "Technology", "Other"];
