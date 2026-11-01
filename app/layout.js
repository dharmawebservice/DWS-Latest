import localFont from "next/font/local";
import "./globals.css";
import { SITE } from "@/lib/content";

// Self-hosted fonts: no third-party request for visitors, and builds work offline.
const sans = localFont({
  src: "./fonts/dm-sans-latin-wght-normal.woff2",
  weight: "100 1000",
  variable: "--font-sans-dws",
  display: "swap",
  adjustFontFallback: "Arial",
});
const display = localFont({
  src: [
    { path: "./fonts/fraunces-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/fraunces-latin-wght-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-display-dws",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const DESCRIPTION =
  "Dharma Web Services builds fast, premium websites, online stores and web apps for growing businesses. Packages from ₹2,499, delivered in 7–14 days.";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Dharma Web Services | Premium Website Development in Hyderabad", template: "%s | Dharma Web Services" },
  description: DESCRIPTION,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Dharma Web Services | Premium Website Development",
    description: DESCRIPTION,
    url: "/",
    siteName: SITE.name,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dharma Web Services | Premium Website Development",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf7f0",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${sans.variable} ${display.variable}`}>
      <body className="bg-bg font-sans text-ink-2 antialiased">{children}</body>
    </html>
  );
}
