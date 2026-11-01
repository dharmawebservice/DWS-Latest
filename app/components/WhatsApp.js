import { SITE } from "@/lib/content";

export default function WhatsApp() {
  return (
    <a
      href={SITE.whatsappHello}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn"
      aria-label="Chat with us on WhatsApp"
    >
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-5.4c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.7 1-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.8-3.3c-.2-.3 0-.4.1-.5l.4-.4c.1-.1.2-.2.3-.4.1-.2 0-.3 0-.4-.1-.1-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 3.9 3.5.5.2.9.4 1.2.5.5.2 1 .2 1.4.1.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1z" />
      </svg>
    </a>
  );
}
