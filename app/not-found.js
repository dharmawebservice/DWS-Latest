import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="hero-glow relative overflow-hidden">
        <div className="container-x relative z-10 py-24 sm:py-36">
          <p className="eyebrow">Error 404</p>
          <h1 className="display-xl mt-5 !text-[clamp(2.4rem,6vw,4.6rem)]">This page <em>doesn&apos;t exist.</em></h1>
          <p className="lede mt-6 max-w-xl">The link may be broken or the page may have moved. Let&apos;s get you back on track.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-gold btn-lg">Back to home <ArrowRight size={17} className="arrow" aria-hidden="true" /></Link>
            <Link href="/contact" className="btn btn-ghost btn-lg">Contact us</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
