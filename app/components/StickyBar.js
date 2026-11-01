import { Phone, MessageCircle, Mail } from "lucide-react";
import { SITE } from "@/lib/content";
import OpenPopup from "./OpenPopup";

// Mobile-only action bar: Call · WhatsApp · Quote. Pure server markup + one tiny button.
export default function StickyBar() {
  return (
    <div className="sticky-bar" role="navigation" aria-label="Quick contact">
      <a href={`tel:${SITE.phoneTel}`}><Phone size={17} aria-hidden="true" />Call</a>
      <a href={SITE.whatsappHello} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} aria-hidden="true" />WhatsApp</a>
      <OpenPopup className="sticky-bar-quote"><Mail size={17} aria-hidden="true" />Get quote</OpenPopup>
    </div>
  );
}
