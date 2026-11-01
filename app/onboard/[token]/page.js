import { notFound } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { getServiceClient } from "../../../lib/supabase";
import OnboardForm from "./OnboardForm";

export const dynamic = "force-dynamic";

// Private client link: never indexed or cached.
export const metadata = {
  title: "Project onboarding",
  robots: { index: false, follow: false, nocache: true },
};

const TOKEN = /^[A-Za-z0-9_-]{16,64}$/;

function Notice({ icon: Icon, title, text }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <div className="card w-full max-w-md p-8 sm:p-10 text-center">
        <span className="icon-tile mx-auto mb-5"><Icon size={20} aria-hidden="true" /></span>
        <h1 className="font-display text-3xl font-normal text-ink">{title}</h1>
        <p className="text-sm mt-3 text-mute leading-relaxed">{text}</p>
      </div>
    </main>
  );
}

export default async function OnboardPage({ params }) {
  const { token } = await params;

  let row = null;
  if (typeof token === "string" && TOKEN.test(token)) {
    try {
      const { data } = await getServiceClient()
        .from("onboarding")
        .select("client_name, package_name, status, expires_at")
        .eq("token", token)
        .maybeSingle();
      row = data || null;
    } catch {
      row = null;
    }
  }

  if (!row) notFound(); // unknown link: real 404 status, nothing revealed
  if (row.status === "submitted") {
    return (
      <Notice icon={CheckCircle2} title="Already submitted"
        text="Thank you — we have your project details and will be in touch shortly." />
    );
  }
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return (
      <Notice icon={Clock} title="This link has expired"
        text="For your security onboarding links expire. Please contact Dharma Web Services and we will send you a fresh one." />
    );
  }

  return <OnboardForm token={token} clientName={row.client_name} packageName={row.package_name || ""} />;
}
