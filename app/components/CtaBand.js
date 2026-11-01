import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/lib/content";

export default function CtaBand({
  title = <>Ready to build something <em>exceptional?</em></>,
  text = "Tell us about your project. We'll reply with a clear plan, timeline and price — no obligation.",
}) {
  return (
    <section className="on-navy">
      <div className="container-x grid items-center gap-8 py-16 sm:py-20 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="display-lg">{title}</h2>
          <p className="mt-4 max-w-xl text-[1.05rem]">{text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link href="/contact" className="btn btn-gold btn-lg">
            Start a project <ArrowRight size={17} className="arrow" aria-hidden="true" />
          </Link>
          <a href={SITE.whatsappHello} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">Chat on WhatsApp</a>
        </div>
      </div>
    </section>
  );
}
