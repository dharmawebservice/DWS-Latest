import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsApp from "../components/WhatsApp";
import LazyWidgets from "../components/LazyWidgets";
import StickyBar from "../components/StickyBar";

// Chrome shared by every public page. The Vault and onboarding links sit
// outside this group, so they never show the marketing header or footer.
export default function SiteLayout({ children }) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <WhatsApp />
      <StickyBar />
      <LazyWidgets />
    </>
  );
}